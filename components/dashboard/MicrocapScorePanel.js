import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import Meter from "@/components/ui/Meter";
import SectionHeader from "./SectionHeader";
import {
  getScoreTier,
  SCORE_COMPONENT_MAX,
  SCORE_COMPONENT_LABELS,
} from "@/mocks/tokens";

const TIER_TEXT_CLASSES = {
  IGNORE: "text-text-muted",
  WATCH: "text-text-secondary",
  "WATCH+": "text-accent",
  "SETUP B": "text-warning",
  "SETUP A": "text-positive",
  "SETUP A+": "text-positive",
};

/**
 * Microcap Score panel: the total score plus its full component
 * breakdown, so "why is this token 91/100" is always answerable from
 * the UI. Displays the supplied mock score components only — no actual
 * Score Engine exists yet (see TASK 06).
 */
export default function MicrocapScorePanel({ token }) {
  const tier = getScoreTier(token.score);
  const tierClass = TIER_TEXT_CLASSES[tier.label] ?? "text-text-secondary";

  return (
    <Card>
      <SectionHeader title="MICROCAP SCORE" />
      <Divider />

      <div className="flex items-baseline justify-between px-4 pt-4">
        <div>
          <span className={`tabular text-3xl font-bold ${tierClass}`}>
            {token.score}
          </span>
          <span className="text-sm text-text-muted"> / 100</span>
        </div>
        <span className={`text-xs font-semibold tracking-wide ${tierClass}`}>
          {tier.label}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 px-4 py-4">
        {Object.entries(SCORE_COMPONENT_LABELS).map(([key, label]) => {
          const value = token.scoreBreakdown[key];
          const max = SCORE_COMPONENT_MAX[key];

          return (
            <Meter
              key={key}
              label={label}
              valueLabel={`${value}/${max}`}
              percent={(value / max) * 100}
              tone="accent"
            />
          );
        })}
      </div>
    </Card>
  );
}
