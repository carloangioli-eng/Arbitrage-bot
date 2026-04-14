import { router } from './_core/trpc';
import { botRouter } from './botRouter';

export const appRouter = router({
  bot: botRouter,
});

export type AppRouter = typeof appRouter;
