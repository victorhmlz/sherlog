/**
 * Base elevated surface used for metric cards, panels, and table
 * containers. Deliberately restrained: a thin border and one radius
 * step, no shadow, no gradient.
 */
export default function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`rounded-lg border border-line bg-surface ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
