import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.optional(v.string()),
    role: v.union(v.literal("organizer"), v.literal("participant")),
    isAnonymous: v.boolean(),
    name: v.optional(v.string()),
  }).index("by_email", ["email"]),

  events: defineTable({
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
    // Organizer contact info (optional)
    organizerName: v.optional(v.string()),
    organizerEmail: v.optional(v.string()),
    organizerPhone: v.optional(v.string()),
    organizerRole: v.optional(v.string()),
    showContactInfo: v.optional(v.boolean()),
  }).index("by_organizer", ["organizerId"]),

  registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    participantName: v.string(),
    participantEmail: v.string(),
    participantPhone: v.string(),
    college: v.string(),
    year: v.string(),
    registrationCode: v.string(), // Short unique code like "REG-A1B2C3"
    teamName: v.optional(v.string()),
    teamId: v.optional(v.string()), // Links team members together
    isTeamLeader: v.optional(v.boolean()),
    teamMembers: v.optional(v.array(v.object({
      name: v.string(),
      email: v.string(),
    }))),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_and_user", ["eventId", "userId"])
    .index("by_team", ["teamId"])
    .index("by_code", ["registrationCode"]),

  attendance: defineTable({
    registrationId: v.id("registrations"),
    participantName: v.string(),
    eventId: v.id("events"),
    teamId: v.optional(v.string()),
    markedByOrganizerId: v.id("users"),
    markedAt: v.number(),
    status: v.literal("Present"),
  })
    .index("by_registration", ["registrationId"])
    .index("by_event", ["eventId"]),

  otpCodes: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
  }).index("by_email", ["email"]),

  announcements: defineTable({
    title: v.string(),
    message: v.string(),
    department: v.optional(v.string()),
    eventId: v.optional(v.id("events")), // null = general, set = event-specific
    priority: v.union(v.literal("normal"), v.literal("important")),
    createdByOrganizerId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_department", ["department"])
    .index("by_event", ["eventId"])
    .index("by_organizer", ["createdByOrganizerId"]),

  discussions: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    userName: v.string(),
    userRole: v.union(v.literal("organizer"), v.literal("participant")),
    type: v.union(v.literal("discussion"), v.literal("question")), // discussion or Q&A
    title: v.optional(v.string()), // For questions
    message: v.string(),
    isAnswered: v.optional(v.boolean()), // For questions
    isPinned: v.optional(v.boolean()), // Organizers can pin important discussions
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_and_type", ["eventId", "type"]),

  comments: defineTable({
    discussionId: v.id("discussions"),
    userId: v.id("users"),
    userName: v.string(),
    userRole: v.union(v.literal("organizer"), v.literal("participant")),
    message: v.string(),
    isAnswer: v.optional(v.boolean()), // Mark organizer reply as answer for Q&A
    createdAt: v.number(),
  })
    .index("by_discussion", ["discussionId"])
    .index("by_user", ["userId"]),

  photos: defineTable({
    eventId: v.id("events"),
    uploadedByUserId: v.id("users"),
    uploadedByName: v.string(),
    storageId: v.id("_storage"), // Convex file storage ID
    caption: v.optional(v.string()),
    uploadedAt: v.number(),
    likes: v.optional(v.number()),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["uploadedByUserId"]),

  photoLikes: defineTable({
    photoId: v.id("photos"),
    userId: v.id("users"),
    likedAt: v.number(),
  })
    .index("by_photo", ["photoId"])
    .index("by_user", ["userId"])
    .index("by_photo_and_user", ["photoId", "userId"]),

  reports: defineTable({
    reportedByUserId: v.id("users"),
    reportedByName: v.string(),
    contentType: v.union(v.literal("discussion"), v.literal("comment"), v.literal("photo")),
    contentId: v.string(),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("resolved")),
    reviewedByOrganizerId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_content", ["contentType", "contentId"]),

  pushSubscriptions: defineTable({
    userId: v.optional(v.id("users")),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    createdAt: v.number(),
  })
    .index("by_endpoint", ["endpoint"])
    .index("by_user", ["userId"]),
});
