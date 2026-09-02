/** Compact section title used above dashboard panels (not a marketing heading). */
export default function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <h2 className="text-[11px] font-semibold tracking-widest text-text-muted">
        {title}
      </h2>
      {action}
    </div>
  );
}
