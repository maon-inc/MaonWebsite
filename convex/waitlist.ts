import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addToWaitlist = mutation({
  args: {
    email: v.string(),
    ipAddress: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("This TypeScript function is running on the server.");
    await ctx.db.insert("waitlist", {
      email: args.email,
      ipAddress: args.ipAddress,
    });
  },
})