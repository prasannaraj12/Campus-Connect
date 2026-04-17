// Generate short unique registration code
export function generateRegistrationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No confusing chars: 0, O, 1, I
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `REG-${code}` // Format: REG-A1B2C3
}

// ============================================
// SECURITY HELPERS - Role-Based Access Control
// ============================================

import { Id } from "./_generated/dataModel";

/**
 * Verify that a user exists and has the "organizer" role
 * @throws Error if user is not an organizer
 */
export async function requireOrganizer(ctx: any, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "organizer") {
    throw new Error("Unauthorized: Organizer access required");
  }
  return user;
}

/**
 * Verify that a user exists and has the "participant" role
 * @throws Error if user is not a participant
 */
export async function requireParticipant(ctx: any, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "participant") {
    throw new Error("Unauthorized: Participant access required");
  }
  return user;
}

/**
 * Verify that a user is an organizer AND owns the specified event
 * @throws Error if user doesn't own the event or is not an organizer
 */
export async function requireEventOwnership(
  ctx: any,
  eventId: Id<"events">,
  userId: Id<"users">
) {
  const event = await ctx.db.get(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const user = await requireOrganizer(ctx, userId);

  if (event.organizerId !== userId) {
    throw new Error("Unauthorized: You don't own this event");
  }

  return { event, user };
}
