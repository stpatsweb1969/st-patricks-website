/**
 * Auth Router — login/logout/me endpoints.
 * ~25 lines
 */
import { publicProcedure, router, ENV } from "./_helpers";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    const user = ctx.user;
    if (!user) return null;
    // Ensure owner always sees admin access even if role field hasn't been updated yet
    const isOwner = user.openId === ENV.ownerOpenId;
    return { ...user, role: isOwner ? 'admin' : user.role };
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
