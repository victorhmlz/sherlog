import Badge from "@/components/ui/Badge";

const SIGNAL_TONES = {
  IGNORE: "neutral",
  WATCH: "accent",
  "WATCH+": "accent",
  "SETUP B": "warning",
  "SETUP A": "positive",
  EXTREME: "positive",
};

/** Renders one of the six discrete signal states (see mocks/tokens.js). */
export default function SignalBadge({ signal }) {
  const tone = SIGNAL_TONES[signal] ?? "neutral";

  return <Badge tone={tone}>{signal}</Badge>;
}
