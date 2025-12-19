import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addToWaitlist = mutation({
  args: {
    email: v.string(),
    country: v.string(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("waitlist")
      .filter((q) => q.eq(q.field("email"), args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("ALREADY_SIGNED_UP");
    }

    await ctx.db.insert("waitlist", {
      email: args.email.toLowerCase(),
      country: args.country,
      region: args.region,
    });
  },
});

export const getWaitlistCount = query({
  args: {},
  handler: async (ctx) => {
    const allEntries = await ctx.db.query("waitlist").collect();
    return allEntries.length;
  },
});