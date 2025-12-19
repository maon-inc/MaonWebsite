import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addToWaitlist = mutation({
  args: {
    email: v.string(),
    country: v.string(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("This TypeScript function is running on the server.");
    await ctx.db.insert("waitlist", {
      email: args.email,
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