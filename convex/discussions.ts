import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new discussion or question
export const createDiscussion = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    userName: v.string(),
    userRole: v.union(v.literal("organizer"), v.literal("participant")),
    type: v.union(v.literal("discussion"), v.literal("question")),
    title: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const discussionId = await ctx.db.insert("discussions", {
      eventId: args.eventId,
      userId: args.userId,
      userName: args.userName,
      userRole: args.userRole,
      type: args.type,
      title: args.title,
      message: args.message,
      isAnswered: args.type === "question" ? false : undefined,
      isPinned: false,
      createdAt: Date.now(),
    });

    return { success: true, discussionId };
  },
});

// Get all discussions for an event
export const getEventDiscussions = query({
  args: {
    eventId: v.id("events"),
    type: v.optional(v.union(v.literal("discussion"), v.literal("question"))),
  },
  handler: async (ctx, args) => {
    let discussionsQuery = ctx.db
      .query("discussions")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId));

    const discussions = await discussionsQuery.collect();

    // Filter by type if specified
    const filtered = args.type
      ? discussions.filter(d => d.type === args.type)
      : discussions;

    // Sort logic:
    // 1. Pinned first
    // 2. For Q&A: Unanswered before answered
    // 3. Then by creation time (newest first)
    return filtered.sort((a, b) => {
      // Pinned always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // For questions, unanswered first
      if (args.type === 'question') {
        if (!a.isAnswered && b.isAnswered) return -1;
        if (a.isAnswered && !b.isAnswered) return 1;
      }

      // Then by creation time (newest first)
      return b.createdAt - a.createdAt;
    });
  },
});

// Pin/unpin a discussion (organizers only)
export const togglePin = mutation({
  args: {
    discussionId: v.id("discussions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "organizer") {
      throw new Error("Only organizers can pin discussions");
    }

    const discussion = await ctx.db.get(args.discussionId);
    if (!discussion) {
      throw new Error("Discussion not found");
    }

    await ctx.db.patch(args.discussionId, {
      isPinned: !discussion.isPinned,
    });

    return { success: true, isPinned: !discussion.isPinned };
  },
});

// Delete a discussion (author or organizer only)
export const deleteDiscussion = mutation({
  args: {
    discussionId: v.id("discussions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const discussion = await ctx.db.get(args.discussionId);
    if (!discussion) {
      throw new Error("Discussion not found");
    }

    const user = await ctx.db.get(args.userId);

    // Check if user is author or organizer
    if (discussion.userId !== args.userId && user?.role !== "organizer") {
      throw new Error("You can only delete your own discussions");
    }

    // Delete all comments first
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_discussion", (q) => q.eq("discussionId", args.discussionId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete the discussion
    await ctx.db.delete(args.discussionId);

    return { success: true };
  },
});

// Add a comment to a discussion
export const addComment = mutation({
  args: {
    discussionId: v.id("discussions"),
    userId: v.id("users"),
    userName: v.string(),
    userRole: v.union(v.literal("organizer"), v.literal("participant")),
    message: v.string(),
    isAnswer: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      discussionId: args.discussionId,
      userId: args.userId,
      userName: args.userName,
      userRole: args.userRole,
      message: args.message,
      isAnswer: args.isAnswer,
      createdAt: Date.now(),
    });

    // If this is marked as an answer, mark the question as answered
    if (args.isAnswer) {
      await ctx.db.patch(args.discussionId, {
        isAnswered: true,
      });
    }

    return { success: true, commentId };
  },
});

// Get comments for a discussion
export const getDiscussionComments = query({
  args: { discussionId: v.id("discussions") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_discussion", (q) => q.eq("discussionId", args.discussionId))
      .collect();

    // Sort by creation time (oldest first for conversation flow)
    return comments.sort((a, b) => a.createdAt - b.createdAt);
  },
});

// Delete a comment (author or organizer only)
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const user = await ctx.db.get(args.userId);

    // Check if user is author or organizer
    if (comment.userId !== args.userId && user?.role !== "organizer") {
      throw new Error("You can only delete your own comments");
    }

    await ctx.db.delete(args.commentId);

    return { success: true };
  },
});


// Report a discussion or comment
export const reportContent = mutation({
  args: {
    userId: v.id("users"),
    userName: v.string(),
    contentType: v.union(v.literal("discussion"), v.literal("comment")),
    contentId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already reported by this user
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_content", (q) =>
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .filter((q) => q.eq(q.field("reportedByUserId"), args.userId))
      .first();

    if (existing) {
      throw new Error("You have already reported this content");
    }

    const reportId = await ctx.db.insert("reports", {
      reportedByUserId: args.userId,
      reportedByName: args.userName,
      contentType: args.contentType,
      contentId: args.contentId,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true, reportId };
  },
});

// Get reports (organizers only)
export const getReports = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(v.literal("pending"), v.literal("reviewed"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "organizer") {
      throw new Error("Only organizers can view reports");
    }

    let reports;

    if (args.status) {
      reports = await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "reviewed" | "resolved"))
        .collect();
    } else {
      reports = await ctx.db.query("reports").collect();
    }

    return reports.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Resolve a report (organizers only)
export const resolveReport = mutation({
  args: {
    reportId: v.id("reports"),
    userId: v.id("users"),
    status: v.union(v.literal("reviewed"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "organizer") {
      throw new Error("Only organizers can resolve reports");
    }

    await ctx.db.patch(args.reportId, {
      status: args.status,
      reviewedByOrganizerId: args.userId,
    });

    return { success: true };
  },
});
