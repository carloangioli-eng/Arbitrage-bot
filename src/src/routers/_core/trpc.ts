import { initTRPC } from '@trpc/server';
import { inferAsyncReturnType } from '@trpc/server';

export const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Per ora usiamo protected solo come placeholder
export const protectedProcedure = t.procedure;

export const createContext = () => ({});
export type Context = inferAsyncReturnType<typeof createContext>;
