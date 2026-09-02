import { getScoreTier } from "@/mocks/tokens";

const TIER_TEXT_CLASSES = {
  IGNORE: "text-text-muted",
  WATCH: "text-text-secondary",
  "WATCH+": "text-accent",
  "SETUP B": "text-warning",
  "SETUP A": "text-positive",
  "SETUP A+": "text-positive",
};

/**
 * Score visualization: always shows the raw number AND the tier label
 * together, so meaning never depends on color alone.
 */
export default function ScoreBadge({ score }) {
  const tier = getScoreTier(score);
  const textClass = TIER_TEXT_CLASSES[tier.label] ?? "text-text-secondary";

  return (
    <div className="flex flex-col items-start leading-tight">
      <span className={`tabular text-sm font-semibold ${textClass}`}>
        {score}
        <span className="text-text-muted">/100</span>
      </span>
      <span className="text-[10px] font-medium tracking-wide text-text-muted">
        {tier.label}
      </span>
    </div>
  );
}
