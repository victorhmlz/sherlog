CREATE TABLE "auction_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_id" uuid NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"auction_progress" numeric(5, 2),
	"expected_progress" numeric(5, 2),
	"auction_efficiency" numeric(6, 3),
	"price" numeric(38, 18),
	"tokens_sold" numeric(38, 2)
);
--> statement-breakpoint
CREATE TABLE "market_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_id" uuid NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"price" numeric(38, 18) NOT NULL,
	"market_cap" numeric(38, 2),
	"liquidity" numeric(38, 2),
	"volume_5m" numeric(38, 2),
	"volume_15m" numeric(38, 2),
	"volume_30m" numeric(38, 2),
	"buys_5m" integer,
	"sells_5m" integer,
	"unique_buyers_5m" integer,
	"unique_sellers_5m" integer,
	"buy_pressure" numeric(5, 2),
	"holders" integer,
	"top1_pct" numeric(5, 2),
	"top5_pct" numeric(5, 2),
	"top10_pct" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "paper_trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_id" uuid NOT NULL,
	"entry_time" timestamp with time zone NOT NULL,
	"entry_price" numeric(38, 18) NOT NULL,
	"exit_time" timestamp with time zone,
	"exit_price" numeric(38, 18),
	"position_size" numeric(38, 2) NOT NULL,
	"pnl" numeric(38, 2),
	"pnl_percent" numeric(10, 4),
	"max_drawdown" numeric(10, 4),
	"max_runup" numeric(10, 4),
	"entry_score" integer,
	"exit_reason" text
);
--> statement-breakpoint
CREATE TABLE "signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_id" uuid NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"score" integer NOT NULL,
	"setup" text NOT NULL,
	"momentum_score" integer,
	"liquidity_score" integer,
	"holder_score" integer,
	"auction_score" integer,
	"external_signal_score" integer,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" text NOT NULL,
	"chain_id" integer NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auction_data" ADD CONSTRAINT "auction_data_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_snapshots" ADD CONSTRAINT "market_snapshots_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_trades" ADD CONSTRAINT "paper_trades_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signals" ADD CONSTRAINT "signals_token_id_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auction_data_token_id_timestamp_idx" ON "auction_data" USING btree ("token_id","timestamp");--> statement-breakpoint
CREATE INDEX "market_snapshots_token_id_timestamp_idx" ON "market_snapshots" USING btree ("token_id","timestamp");--> statement-breakpoint
CREATE INDEX "paper_trades_token_id_entry_time_idx" ON "paper_trades" USING btree ("token_id","entry_time");--> statement-breakpoint
CREATE INDEX "signals_token_id_timestamp_idx" ON "signals" USING btree ("token_id","timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "tokens_address_chain_id_idx" ON "tokens" USING btree ("address","chain_id");