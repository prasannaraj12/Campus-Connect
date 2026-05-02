import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAnonymousUser = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const userId = await ctx.db.insert("users", {
        role: "participant",
        isAnonymous: true,
        name: args.name,
      });
      console.log("Created anonymous user:", userId);
      return userId;
    } catch (error) {
      console.error("Error creating anonymous user:", error);
      throw new Error("Failed to create anonymous user");
    }
  },
});

export const createOrganizerUser = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      if (existing) {
        return existing._id;
      }

      const userId = await ctx.db.insert("users", {
        email: args.email,
        role: "organizer",
        isAnonymous: false,
      });
      console.log("Created organizer user:", userId);
      return userId;
    } catch (error) {
      console.error("Error creating organizer user:", error);
      throw new Error("Failed to create organizer user");
    }
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const createParticipantUser = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()
    if (existing) return existing._id
    return await ctx.db.insert("users", {
      email: args.email,
      role: "participant",
      isAnonymous: false,
    })
  },
})
