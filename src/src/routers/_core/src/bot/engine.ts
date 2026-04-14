import * as ccxt from 'ccxt';
import { db } from '../db';
import { botSettings, trades, botLogs } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';

export interface Triangle {
  base: string;
  quote: string;
  bridge: string;
  path: string[];
}

interface ActiveTrade {
  id: string;
  triangle: Triangle;
  entryTime: Date;
  initialUSDT: number;
  baseAmount: number;
  currentStep: number;
  orders: string[];
}

export class ArbitrageEngine {
  public exchange: ccxt.Exchange;
  private userId: string;
  public isRunning = false;

  private settings: any = null;
  private activeTriangles: Triangle[] = [];
  private blacklistedTriangles = new Set<string>();
  private activeTrades = new Map<string, ActiveTrade>();

  private tickerWatcher: any = null;
  private stopLossInterval: NodeJS.Timeout | null = null;

  constructor(userId: string) {
    this.userId = userId;
    this.exchange = new ccxt.binance({ enableRateLimit: true });
  }

  async init() {
    const userSettings = await db!.query.botSettings.findFirst({
      where: eq(botSettings.userId, this.userId),
    });
    if (!userSettings) throw new Error('Bot settings not found');

    this.settings = userSettings;

    this.exchange = this.settings.exchange === 'mexc' 
      ? new ccxt.mexc({ enableRateLimit: true, apiKey: this.settings.mexcApiKey, secret: this.settings.mexcApiSecret })
      : new ccxt.binance({ enableRateLimit: true, apiKey: this.settings.binanceApiKey, secret: this.settings.binanceApiSecret });

    this.activeTriangles = typeof this.settings.activeTriangles === 'string'
      ? JSON.parse(this.settings.activeTriangles)
      : (this.settings.activeTriangles || []);

    console.log(`✅ Engine initialized for user ${this.userId}`);
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`🚀 Bot started for user ${this.userId}`);
  }

  async stop() {
    this.isRunning = false;
    console.log(`⛔ Bot stopped for user ${this.userId}`);
  }

  // Metodo per il frontend
  getActiveTrades() {
    return {
      activeTrades: Array.from(this.activeTrades.values()).map(t => ({
        path: t.triangle.path.join(' → '),
        duration: Math.floor((Date.now() - t.entryTime.getTime()) / 1000),
      })),
      blacklistedCount: this.blacklistedTriangles.size,
    };
  }
}
