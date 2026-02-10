import { mutation } from "./_generated/server";

// Run this once to migrate old registrations to new schema
export const migrateRegistrations = mutation({
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();

    let migratedCount = 0;

    for (const reg of registrations) {
      // @ts-ignore - accessing old field
      if (reg.attended !== undefined || reg.attendedAt !== undefined) {
        // Remove old fields by replacing the document
        await ctx.db.replace(reg._id, {
          eventId: reg.eventId,
          userId: reg.userId,
          participantName: reg.participantName,
          participantEmail: reg.participantEmail,
          participantPhone: reg.participantPhone,
          college: reg.college,
          year: reg.year,
          teamName: reg.teamName,
          teamId: reg.teamId,
          isTeamLeader: reg.isTeamLeader,
          teamMembers: reg.teamMembers,
          registrationCode: (reg as any).registrationCode || "LEGACY-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        });
        migratedCount++;
      }
    }

    return {
      success: true,
      migratedCount,
      message: `Migrated ${migratedCount} registrations`
    };
  },
});
