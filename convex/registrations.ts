import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateRegistrationCode } from "./utils";

export const register = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    participantName: v.string(),
    participantEmail: v.string(),
    participantPhone: v.string(),
    college: v.string(),
    year: v.string(),
    teamName: v.optional(v.string()),
    teamMembers: v.optional(v.array(v.object({
      name: v.string(),
      email: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    // Check if already registered
    const existing = await ctx.db
      .query("registrations")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      throw new Error("Already registered for this event");
    }

    // Check max participants
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // 🔐 TEAM VALIDATION: ONLY WHEN isTeamEvent === true
    if (event.isTeamEvent === true) {
      // This is a team event - enforce team size
      if (!event.teamSize) {
        throw new Error("Team event is missing team size configuration");
      }

      const totalParticipants = 1 + (args.teamMembers?.length ?? 0);

      if (totalParticipants !== event.teamSize) {
        throw new Error(
          `This event requires teams of exactly ${event.teamSize} participants`
        );
      }

      if (!args.teamName || args.teamName.trim().length === 0) {
        throw new Error("Team name is required for team events");
      }

      // Check capacity for entire team
      if (registrations.length + totalParticipants > event.maxParticipants) {
        throw new Error("Not enough space for entire team");
      }
    } else {
      // Solo event - check individual capacity
      if (registrations.length >= event.maxParticipants) {
        throw new Error("Event is full");
      }
    }

    // 🎯 INDIVIDUAL QR STRATEGY: Create separate registration for each participant
    const registrationIds: string[] = [];
    const registrationCodes: string[] = [];

    if (event.isTeamEvent && args.teamMembers) {
      // Generate unique team ID
      const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Helper function to generate unique code
      const generateUniqueCode = async () => {
        let code = generateRegistrationCode();
        let attempts = 0;

        // Ensure code is unique
        while (attempts < 10) {
          const existing = await ctx.db
            .query("registrations")
            .withIndex("by_code", (q) => q.eq("registrationCode", code))
            .first();

          if (!existing) return code;

          code = generateRegistrationCode();
          attempts++;
        }

        return code;
      };

      // 1. Register team leader (the user)
      const leaderCode = await generateUniqueCode();
      const leaderRegId = await ctx.db.insert("registrations", {
        eventId: args.eventId,
        userId: args.userId,
        participantName: args.participantName,
        participantEmail: args.participantEmail,
        participantPhone: args.participantPhone,
        college: args.college,
        year: args.year,
        registrationCode: leaderCode,
        teamName: args.teamName,
        teamId: teamId,
        isTeamLeader: true,
        teamMembers: args.teamMembers, // Store for reference
      });
      registrationIds.push(leaderRegId);
      registrationCodes.push(leaderCode);

      // 2. Register each team member individually (separate QR for each)
      for (const member of args.teamMembers) {
        const memberCode = await generateUniqueCode();
        const memberRegId = await ctx.db.insert("registrations", {
          eventId: args.eventId,
          userId: args.userId, // Same user ID (team leader owns all)
          participantName: member.name,
          participantEmail: member.email,
          participantPhone: args.participantPhone, // Use leader's phone
          college: args.college,
          year: args.year,
          registrationCode: memberCode,
          teamName: args.teamName,
          teamId: teamId,
          isTeamLeader: false,
          teamMembers: undefined, // Members don't store team list
        });
        registrationIds.push(memberRegId);
        registrationCodes.push(memberCode);
      }

      return {
        success: true,
        leaderRegistrationId: leaderRegId,
        leaderRegistrationCode: leaderCode,
        allRegistrationIds: registrationIds,
        allRegistrationCodes: registrationCodes,
        teamId: teamId,
        message: `Team registered! ${registrationIds.length} QR codes generated.`
      };
    } else {
      // Solo/Workshop event - single registration
      const code = await (async () => {
        let code = generateRegistrationCode();
        let attempts = 0;

        while (attempts < 10) {
          const existing = await ctx.db
            .query("registrations")
            .withIndex("by_code", (q) => q.eq("registrationCode", code))
            .first();

          if (!existing) return code;

          code = generateRegistrationCode();
          attempts++;
        }

        return code;
      })();

      const registrationId = await ctx.db.insert("registrations", {
        eventId: args.eventId,
        userId: args.userId,
        participantName: args.participantName,
        participantEmail: args.participantEmail,
        participantPhone: args.participantPhone,
        college: args.college,
        year: args.year,
        registrationCode: code,
        teamName: undefined,
        teamId: undefined,
        isTeamLeader: undefined,
        teamMembers: undefined,
      });

      return {
        success: true,
        leaderRegistrationId: registrationId,
        leaderRegistrationCode: code,
        allRegistrationIds: [registrationId],
        allRegistrationCodes: [code],
        message: "Registration successful!"
      };
    }
  },
});

export const cancelRegistration = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (!registration) {
      throw new Error("Registration not found");
    }

    await ctx.db.delete(registration._id);
    return { success: true };
  },
});

export const isRegistered = query({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    return registration;
  },
});

export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const myRegistrations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const markAttendance = mutation({
  args: {
    registrationId: v.id("registrations"),
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify organizer
    const organizer = await ctx.db.get(args.organizerId);
    if (!organizer || organizer.role !== "organizer") {
      throw new Error("Only organizers can mark attendance");
    }

    // Get registration
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    // Check if already marked
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_registration", (q) => q.eq("registrationId", args.registrationId))
      .first();

    if (existing) {
      return {
        success: false,
        alreadyMarked: true,
        attendance: existing,
        message: "Attendance already marked"
      };
    }

    // Mark attendance
    const attendanceId = await ctx.db.insert("attendance", {
      registrationId: args.registrationId,
      participantName: registration.participantName,
      eventId: registration.eventId,
      teamId: registration.teamId,
      markedByOrganizerId: args.organizerId,
      markedAt: Date.now(),
      status: "Present",
    });

    return {
      success: true,
      alreadyMarked: false,
      attendanceId,
      registration,
      message: "Attendance marked successfully"
    };
  },
});

export const getAttendance = query({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendance")
      .withIndex("by_registration", (q) => q.eq("registrationId", args.registrationId))
      .first();
  },
});

export const getEventAttendance = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendance")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});


export const getMyAttendanceCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      // Get all registrations for this user
      const registrations = await ctx.db
        .query("registrations")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();

      if (!registrations || registrations.length === 0) {
        return 0;
      }

      // Count how many have attendance records
      let attendedCount = 0;
      for (const reg of registrations) {
        const attendance = await ctx.db
          .query("attendance")
          .withIndex("by_registration", (q) => q.eq("registrationId", reg._id))
          .first();

        if (attendance) {
          attendedCount++;
        }
      }

      return attendedCount;
    } catch (error) {
      console.error("Error getting attendance count:", error);
      return 0;
    }
  },
});


export const getRegistrationById = query({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) return null;

    const event = await ctx.db.get(registration.eventId);
    return {
      ...registration,
      event: event ? {
        title: event.title,
        date: event.date,
      } : undefined
    };
  },
});


export const getRegistrationByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("registrations")
      .withIndex("by_code", (q) => q.eq("registrationCode", args.code))
      .first();

    if (!registration) return null;

    const event = await ctx.db.get(registration.eventId);
    return {
      ...registration,
      event: event ? {
        title: event.title,
        date: event.date,
      } : undefined
    };
  },
});
