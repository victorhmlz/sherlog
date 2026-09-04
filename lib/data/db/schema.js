// -----------------------------------------------------------------------
// MICROCAP ENGINE — database schema (TASK 09)
//
// Drizzle ORM table definitions, translating the conceptual data model
// in docs/ARCHITECTURE.md §5 (Token, MarketSnapshot, AuctionData,
// Signal, PaperTrade) into real PostgreSQL tables. This is
// infrastructure only — no route or component reads or writes through
// this schema yet (dashboard/token-detail still read `mocks/tokens.js`
// exclusively). Wiring real snapshots is TASK 10 — HISTORICAL
// SNAPSHOTS; this task only makes the schema and a DB client exist.
//
// Numeric columns use Postgres `numeric` (arbitrary precision), not
// `real`/`double precision`, because microcap prices routinely have
// many significant decimal digits (e.g. 0.000000421) where floating
// point would silently lose precision.
// -----------------------------------------------------------------------

import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Token — identity only. One row per (address, chainId); everything
 * time-varying about a token lives in the other tables, one row per
 * observation, not mutated in place.
 */
export const tokens = pgTable(
  "tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    address: text("address").notNull(),
    chainId: integer("chain_id").notNull(),
    symbol: text("symbol").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Same address can exist on more than one chain — the pair is the
    // real natural key, not the address alone.
    uniqueIndex("tokens_address_chain_id_idx").on(table.address, table.chainId),
  ],
);

/**
 * MarketSnapshot — one row per point-in-time market read for a token
 * (price, liquidity, volume, holder concentration). This is the
 * time-series table TASK 10 will start writing to on a schedule.
 */
export const marketSnapshots = pgTable(
  "market_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenId: uuid("token_id")
      .notNull()
      .references(() => tokens.id, { onDelete: "cascade" }),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    price: numeric("price", { precision: 38, scale: 18 }).notNull(),
    marketCap: numeric("market_cap", { precision: 38, scale: 2 }),
    liquidity: numeric("liquidity", { precision: 38, scale: 2 }),
    volume5m: numeric("volume_5m", { precision: 38, scale: 2 }),
    volume15m: numeric("volume_15m", { precision: 38, scale: 2 }),
    volume30m: numeric("volume_30m", { precision: 38, scale: 2 }),
    buys5m: integer("buys_5m"),
    sells5m: integer("sells_5m"),
    uniqueBuyers5m: integer("unique_buyers_5m"),
    uniqueSellers5m: integer("unique_sellers_5m"),
    buyPressure: numeric("buy_pressure", { precision: 5, scale: 2 }),
    holders: integer("holders"),
    top1Pct: numeric("top1_pct", { precision: 5, scale: 2 }),
    top5Pct: numeric("top5_pct", { precision: 5, scale: 2 }),
    top10Pct: numeric("top10_pct", { precision: 5, scale: 2 }),
  },
  (table) => [
    // Every read of this table in practice is "snapshots for token X,
    // ordered by time" — this index is the one that matters.
    index("market_snapshots_token_id_timestamp_idx").on(table.tokenId, table.timestamp),
  ],
);

/**
 * AuctionData — one row per point-in-time Long auction read for a
 * token. Separate from MarketSnapshot since auctions are intermittent
 * (a token may have none, per AUCTION_STATUSES "NONE" in mock data),
 * not a continuous stream.
 */
export const auctionData = pgTable(
  "auction_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenId: uuid("token_id")
      .notNull()
      .references(() => tokens.id, { onDelete: "cascade" }),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    auctionProgress: numeric("auction_progress", { precision: 5, scale: 2 }),
    expectedProgress: numeric("expected_progress", { precision: 5, scale: 2 }),
    auctionEfficiency: numeric("auction_efficiency", { precision: 6, scale: 3 }),
    price: numeric("price", { precision: 38, scale: 18 }),
    tokensSold: numeric("tokens_sold", { precision: 38, scale: 2 }),
  },
  (table) => [
    index("auction_data_token_id_timestamp_idx").on(table.tokenId, table.timestamp),
  ],
);

/**
 * Signal — one row per Signal Engine (TASK 08) evaluation for a token
 * at a point in time: the persisted, explainable output of
 * `computeScore` + `computeRisk` + `computeSignal`, not just the final
 * label. `momentumScore`/`liquidityScore`/`holderScore`/`auctionScore`/
 * `externalSignalScore` mirror the Score Engine's component breakdown
 * (`volume`+`buyers` collapsed to one `momentumScore` here, matching
 * ARCHITECTURE.md §5's shape — `lib/scoring/scoreEngine.js` keeps them
 * separate for display; this table follows the architecture doc's
 * persisted shape instead of the display shape).
 */
export const signals = pgTable(
  "signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenId: uuid("token_id")
      .notNull()
      .references(() => tokens.id, { onDelete: "cascade" }),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    score: integer("score").notNull(),
    setup: text("setup").notNull(),
    momentumScore: integer("momentum_score"),
    liquidityScore: integer("liquidity_score"),
    holderScore: integer("holder_score"),
    auctionScore: integer("auction_score"),
    externalSignalScore: integer("external_signal_score"),
    reason: text("reason"),
  },
  (table) => [
    index("signals_token_id_timestamp_idx").on(table.tokenId, table.timestamp),
  ],
);

/**
 * PaperTrade — one row per simulated (never real) entry/exit. No
 * capital, no wallet, no execution — see docs/ARCHITECTURE.md §10.
 * `exitTime`/`exitPrice`/`pnl`/`pnlPercent`/`maxDrawdown`/`maxRunup`/
 * `exitReason` are nullable: a trade is open until those are filled in.
 */
export const paperTrades = pgTable(
  "paper_trades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenId: uuid("token_id")
      .notNull()
      .references(() => tokens.id, { onDelete: "cascade" }),
    entryTime: timestamp("entry_time", { withTimezone: true }).notNull(),
    entryPrice: numeric("entry_price", { precision: 38, scale: 18 }).notNull(),
    exitTime: timestamp("exit_time", { withTimezone: true }),
    exitPrice: numeric("exit_price", { precision: 38, scale: 18 }),
    positionSize: numeric("position_size", { precision: 38, scale: 2 }).notNull(),
    pnl: numeric("pnl", { precision: 38, scale: 2 }),
    pnlPercent: numeric("pnl_percent", { precision: 10, scale: 4 }),
    maxDrawdown: numeric("max_drawdown", { precision: 10, scale: 4 }),
    maxRunup: numeric("max_runup", { precision: 10, scale: 4 }),
    entryScore: integer("entry_score"),
    exitReason: text("exit_reason"),
  },
  (table) => [
    index("paper_trades_token_id_entry_time_idx").on(table.tokenId, table.entryTime),
  ],
);
