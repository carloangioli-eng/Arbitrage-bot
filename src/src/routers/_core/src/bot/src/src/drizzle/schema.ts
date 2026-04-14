import { pgTable, text, boolean, real, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const botSettings = pgTable('bot_settings', {
  userId: text('user_id').primaryKey(),
  exchange: text('exchange').default('binance'),
  dryRun: boolean('dry_run').default(true),
  tradeAmount: real('trade_amount').default(50),
  minProfitPercent: real('min_profit_percent').default(0.25),
  maxLossPercent: real('max_loss_percent').default(1.5),
  stopLossTimeoutSeconds: integer('stop_loss_timeout_seconds').default(45),
  telegramBotToken: text('telegram_bot_token'),
  telegramChatId: text('telegram_chat_id'),
  activeTriangles: jsonb('active_triangles').default([]),
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
