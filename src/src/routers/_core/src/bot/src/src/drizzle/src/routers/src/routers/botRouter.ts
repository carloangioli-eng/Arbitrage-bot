import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { ArbitrageEngine } from '../bot/engine';
import { db } from '../db';
import { botSettings } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const botInstances = new Map<string, ArbitrageEngine>();

export const botRouter = router({
  // Toggle Bot (Start/Stop)
  toggle: protectedProcedure
    .input(z.object({ active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      let bot = botInstances.get(ctx.user.id);

      if (!bot) {
        bot = new ArbitrageEngine(ctx.user.id);
        botInstances.set(ctx.user.id, bot);
        await bot.init();
      }

      if (input.active) {
        await bot.start();
        await db.update(botSettings).set({ isActive: true }).where(eq(botSettings.userId, ctx.user.id));
      } else {
        await bot.stop();
        botInstances.delete(ctx.user.id);
        await db.update(botSettings).set({ isActive: false }).where(eq(botSettings.userId, ctx.user.id));
      }

      return { success: true, active: input.active };
    }),

  // Dashboard trade attivi
  getActiveTrades: protectedProcedure.query(async ({ ctx }) => {
    const bot = botInstances.get(ctx.user.id);
    return bot ? bot.getActiveTrades() : { activeTrades: [], blacklistedCount: 0 };
  }),

  // Impostazioni (per ora base)
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.botSettings.findFirst({
      where: eq(botSettings.userId, ctx.user.id),
    });
  }),
});
