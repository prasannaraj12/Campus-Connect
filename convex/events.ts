import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.string(),
    time: v.string(),
    location: v.string(),
    category: v.union(
      v.literal("Workshop"),
      v.literal("Seminar"),
      v.literal("Sports"),
      v.literal("Cultural"),
      v.literal("Technical"),
      v.literal("Social"),
      v.literal("Hackathon")
    ),
    maxParticipants: v.number(),
    organizerId: v.id("users"),
    isTeamEvent: v.boolean(),
    teamSize: v.optional(v.number()),
    requirements: v.optional(v.string()),
    organizerName: v.optional(v.string()),
    organizerEmail: v.optional(v.string()),
    organizerPhone: v.optional(v.string()),
    organizerRole: v.optional(v.string()),
    showContactInfo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.organizerId);

    if (!user || user.role !== "organizer") {
      console.error("Unauthorized: User is not an organizer", args.organizerId);
      throw new Error("Only organizers can create events");
    }

    // EDGE CASE SAFETY: If not a team event, force teamSize to null
    let finalTeamSize = args.teamSize;
    if (!args.isTeamEvent) {
      finalTeamSize = undefined;
    }

    // Validate team event requirements
    if (args.isTeamEvent && (!finalTeamSize || finalTeamSize < 2)) {
      throw new Error("Team events must have a team size of at least 2");
    }

    const eventId = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      date: args.date,
      time: args.time,
      location: args.location,
      category: args.category,
      maxParticipants: args.maxParticipants,
      organizerId: args.organizerId,
      isTeamEvent: args.isTeamEvent,
      teamSize: finalTeamSize,
      requirements: args.requirements,
      organizerName: args.organizerName,
      organizerEmail: args.organizerEmail,
      organizerPhone: args.organizerPhone,
      organizerRole: args.organizerRole,
      showContactInfo: args.showContactInfo,
    });

    console.log("Event created:", eventId, "isTeamEvent:", args.isTeamEvent);
    return eventId;
  },
});

export const getAllEvents = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();

    // Sort by date ascending (soonest first)
    const sorted = events.sort((a, b) => {
      const da = new Date(`${a.date}T${a.time || '00:00'}`).getTime()
      const db = new Date(`${b.date}T${b.time || '00:00'}`).getTime()
      return da - db
    })

    // 🛡️ SECURITY CHECK: Redact contact info if showContactInfo is false
    return sorted.map(event => {
      if (!event.showContactInfo) {
        return {
          ...event,
          organizerEmail: undefined,
          organizerPhone: undefined,
          organizerName: event.organizerName ? "(Hidden)" : undefined,
        };
      }
      return event;
    });
  },
});

// Returns only upcoming events (date >= today), sorted soonest first
export const getUpcomingEvents = query({
  handler: async (ctx) => {
    const now = new Date()
    const events = await ctx.db.query("events").collect()

    return events
      .filter(e => {
        const eventDate = new Date(`${e.date}T${e.time || '00:00'}`)
        return eventDate >= now
      })
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time || '00:00'}`).getTime()
        const db = new Date(`${b.date}T${b.time || '00:00'}`).getTime()
        return da - db
      })
      .map(event => {
        if (!event.showContactInfo) {
          return {
            ...event,
            organizerEmail: undefined,
            organizerPhone: undefined,
            organizerName: event.organizerName ? "(Hidden)" : undefined,
          }
        }
        return event
      })
  },
})

export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    // 🛡️ SECURITY CHECK: Redact contact info if showContactInfo is false
    if (!event.showContactInfo) {
      return {
        ...event,
        organizerEmail: undefined,
        organizerPhone: undefined,
        organizerName: event.organizerName ? "(Hidden)" : undefined,
      };
    }
    return event;
  },
});

export const getEventsByOrganizer = query({
  args: { organizerId: v.id("users") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId))
      .collect();

    // Sort by date ascending (upcoming first)
    const sorted = events.sort((a, b) => {
      const da = new Date(`${a.date}T${a.time || '00:00'}`).getTime()
      const db = new Date(`${b.date}T${b.time || '00:00'}`).getTime()
      return da - db
    })

    // 🛡️ SECURITY CHECK: Redact contact info if showContactInfo is false
    return sorted.map(event => {
      if (!event.showContactInfo) {
        return {
          ...event,
          organizerEmail: undefined,
          organizerPhone: undefined,
          organizerName: event.organizerName ? "(Hidden)" : undefined,
        };
      }
      return event;
    });
  },
});

// Delete event functionality removed as per requirements

// Temporary mutation to fix event ownership mismatch
// 🔒 SECURITY: This should be removed or heavily restricted in production
export const reassignOrganizer = mutation({
  args: {
    eventId: v.id("events"),
    newOrganizerId: v.id("users"),
    adminUserId: v.id("users"), // 🔒 SECURITY: Added to verify admin access
  },
  handler: async (ctx, args) => {
    // 🔒 SECURITY: Only allow organizers to reassign (or add admin role check)
    const { requireOrganizer } = await import("./utils");
    await requireOrganizer(ctx, args.adminUserId);
    
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // 🔒 SECURITY: Verify the admin owns the event or is a super admin
    if (event.organizerId !== args.adminUserId) {
      throw new Error("Unauthorized: You can only reassign your own events");
    }

    await ctx.db.patch(args.eventId, {
      organizerId: args.newOrganizerId,
    });

    console.log(`Reassigned event ${args.eventId} to organizer ${args.newOrganizerId}`);
    return { success: true };
  },
});

// Update event mutation
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"), // 🔒 SECURITY: Added to verify ownership
    title: v.string(),
    description: v.string(),
    date: v.string(),
    time: v.string(),
    location: v.string(),
    category: v.union(
      v.literal("Workshop"),
      v.literal("Seminar"),
      v.literal("Sports"),
      v.literal("Cultural"),
      v.literal("Technical"),
      v.literal("Social")
    ),
    maxParticipants: v.number(),
    isTeamEvent: v.boolean(),
    teamSize: v.optional(v.number()),
    requirements: v.optional(v.string()),
    organizerName: v.optional(v.string()),
    organizerEmail: v.optional(v.string()),
    organizerPhone: v.optional(v.string()),
    organizerRole: v.optional(v.string()),
    showContactInfo: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 🔒 SECURITY: Import helper at top of file
    const { requireEventOwnership } = await import("./utils");
    
    // 🔒 SECURITY: Verify user is organizer and owns this event
    await requireEventOwnership(ctx, args.eventId, args.userId);

    await ctx.db.patch(args.eventId, {
      title: args.title,
      description: args.description,
      date: args.date,
      time: args.time,
      location: args.location,
      category: args.category,
      maxParticipants: args.maxParticipants,
      isTeamEvent: args.isTeamEvent,
      teamSize: args.isTeamEvent ? args.teamSize : undefined,
      requirements: args.requirements,
      organizerName: args.organizerName,
      organizerEmail: args.organizerEmail,
      organizerPhone: args.organizerPhone,
      organizerRole: args.organizerRole,
      showContactInfo: args.showContactInfo,
    });

    console.log("Event updated:", args.eventId);
    return { success: true };
  },
});

// Delete event mutation
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 🔒 SECURITY: Verify user is organizer and owns this event
    const { requireEventOwnership } = await import("./utils");
    await requireEventOwnership(ctx, args.eventId, args.userId);

    // Delete all registrations for this event
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const reg of registrations) {
      await ctx.db.delete(reg._id);
    }

    // Delete the event
    await ctx.db.delete(args.eventId);

    console.log("Event deleted:", args.eventId);
    return { success: true };
  },
});
