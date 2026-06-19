/**
 * Shared auth procedure helpers used across all domain routers.
 * Keep this file small — only auth middleware definitions.
 */
import { protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { ENV } from "../_core/env";
import { type UserRole, type AdminSection, hasAccess, isStaffRole } from "../../shared/roles";

// Re-export commonly used items for convenience
export { publicProcedure, protectedProcedure, router } from "../_core/trpc";
export { TRPCError } from "@trpc/server";
export { z } from "zod";
export { nanoid } from "nanoid";
export { ENV } from "../_core/env";
export * as db from "../db";
export { storagePut } from "../storage";
export { notifyOwner } from "../_core/notification";

/** Full admin procedure - only admin or owner can access */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const isOwner = ctx.user.openId === ENV.ownerOpenId;
  const isAdmin = ctx.user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

/** Staff procedure - any staff role (not just admin) can access */
export const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  const isOwner = ctx.user.openId === ENV.ownerOpenId;
  if (!isOwner && !isStaffRole(ctx.user.role as UserRole)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Staff access required" });
  }
  return next({ ctx });
});

/** Section-specific procedure factory */
export function sectionProcedure(section: AdminSection) {
  return protectedProcedure.use(({ ctx, next }) => {
    const isOwner = ctx.user.openId === ENV.ownerOpenId;
    const role = ctx.user.role as UserRole;
    if (!isOwner && !hasAccess(role, section)) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Access to ${section} denied` });
    }
    return next({ ctx });
  });
}
