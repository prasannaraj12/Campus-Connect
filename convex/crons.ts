import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired OTP codes every hour
crons.interval(
  "cleanup expired OTPs",
  { hours: 1 },
  internal.auth.cleanupExpiredOTPs
);

export default crons;
