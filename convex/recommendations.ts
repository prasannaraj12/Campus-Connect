import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get recommended events for a participant based on their registration history.
 * Analyzes past registrations to identify preferred categories and suggests
 * upcoming events that match their interests.
 */
export const getRecommendedEvents = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Get user's past registrations
        const registrations = await ctx.db
            .query("registrations")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        if (registrations.length === 0) {
            return [];
        }

        // Get event details for registered events to analyze preferences
        const registeredEventIds = new Set<string>();
        const categoryScores: Record<string, number> = {};

        for (const reg of registrations) {
            registeredEventIds.add(reg.eventId);
            const event = await ctx.db.get(reg.eventId);
            if (event) {
                // Increase score for each category the user has registered for
                categoryScores[event.category] = (categoryScores[event.category] || 0) + 1;
            }
        }

        // Get all upcoming events
        const allEvents = await ctx.db.query("events").collect();
        const now = new Date();

        // Filter to upcoming events not already registered
        const upcomingEvents = allEvents.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= now && !registeredEventIds.has(event._id);
        });

        if (upcomingEvents.length === 0) {
            return [];
        }

        // Score events based on user preferences
        const scoredEvents = upcomingEvents.map((event) => {
            let score = 0;

            // Category match score (higher if user has registered for this category before)
            const categoryWeight = categoryScores[event.category] || 0;
            score += categoryWeight * 10;

            // Recency bonus (events happening sooner get higher scores)
            const daysUntil = Math.ceil(
                (new Date(event.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysUntil <= 7) score += 5;
            else if (daysUntil <= 14) score += 3;
            else if (daysUntil <= 30) score += 1;

            // Small random factor for variety
            score += Math.random() * 2;

            return { event, score };
        });

        // Sort by score and return top 6
        scoredEvents.sort((a, b) => b.score - a.score);
        return scoredEvents.slice(0, 6).map((item) => item.event);
    },
});

/**
 * Get similar events based on category and attributes.
 * Used on Event Detail page to suggest related events.
 */
export const getSimilarEvents = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const currentEvent = await ctx.db.get(args.eventId);
        if (!currentEvent) {
            return [];
        }

        // Get all events
        const allEvents = await ctx.db.query("events").collect();
        const now = new Date();

        // Filter out current event and past events
        const otherEvents = allEvents.filter((event) => {
            const eventDate = new Date(event.date);
            return event._id !== args.eventId && eventDate >= now;
        });

        if (otherEvents.length === 0) {
            return [];
        }

        // Score events by similarity
        const scoredEvents = otherEvents.map((event) => {
            let score = 0;

            // Same category is the strongest signal
            if (event.category === currentEvent.category) {
                score += 20;
            }

            // Same event type (team vs solo)
            if (event.isTeamEvent === currentEvent.isTeamEvent) {
                score += 5;
            }

            // Similar capacity range
            const capacityDiff = Math.abs(event.maxParticipants - currentEvent.maxParticipants);
            if (capacityDiff <= 10) score += 3;
            else if (capacityDiff <= 25) score += 2;
            else if (capacityDiff <= 50) score += 1;

            // Date proximity bonus (events around the same time)
            const currentEventDate = new Date(currentEvent.date);
            const eventDate = new Date(event.date);
            const daysDiff = Math.abs(
                (eventDate.getTime() - currentEventDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff <= 3) score += 4;
            else if (daysDiff <= 7) score += 2;

            // Small random factor for variety
            score += Math.random() * 2;

            return { event, score };
        });

        // Sort by score and return top 4
        scoredEvents.sort((a, b) => b.score - a.score);
        return scoredEvents.slice(0, 4).map((item) => item.event);
    },
});
