import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create announcement (organizer only)
export const createAnnouncement = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    // department: v.string(), // Deprecated
    eventId: v.optional(v.id("events")),
    priority: v.union(v.literal("normal"), v.literal("important")),
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify organizer
    const organizer = await ctx.db.get(args.organizerId);
    if (!organizer || organizer.role !== "organizer") {
      throw new Error("Only organizers can create announcements");
    }

    // If eventId provided, verify event exists and organizer owns it
    if (args.eventId) {
      const event = await ctx.db.get(args.eventId);
      if (!event) {
        throw new Error("Event not found");
      }
      if (event.organizerId !== args.organizerId) {
        throw new Error("You can only create announcements for your own events");
      }
    }

    const announcementId = await ctx.db.insert("announcements", {
      title: args.title,
      message: args.message,
      // department: args.department,
      eventId: args.eventId,
      priority: args.priority,
      createdByOrganizerId: args.organizerId,
      createdAt: Date.now(),
    });

    return announcementId;
  },
});

// Get general announcements (for landing page)
export const getGeneralAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    let query = ctx.db.query("announcements");

    const allAnnouncements = await query.collect();

    // Filter for general announcements only (no eventId)
    const generalAnnouncements = allAnnouncements
      .filter((a) => !a.eventId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5); // Latest 5

    return generalAnnouncements;
  },
});

// Get event-specific announcements
export const getEventAnnouncements = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

// Get organizer's announcements
export const getOrganizerAnnouncements = query({
  args: { organizerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_organizer", (q) => q.eq("createdByOrganizerId", args.organizerId))
      .order("desc")
      .collect();
  },
});

// Delete announcement
export const deleteAnnouncement = mutation({
  args: {
    announcementId: v.id("announcements"),
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);
    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // Verify ownership
    if (announcement.createdByOrganizerId !== args.organizerId) {
      throw new Error("You can only delete your own announcements");
    }

    await ctx.db.delete(args.announcementId);
    return { success: true };
  },
});

// Get all announcements (for organizer dashboard)
export const getAllAnnouncements = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("announcements")
      .order("desc")
      .collect();
  },
});
