/**
 * Base elevated surface used for metric cards, panels, and table
 * containers. Uses the gradient-stroke `.border-wireframe` utility
 * (redesign pass 2) instead of a flat border — see globals.css for why
 * plain `border-color` can't do this. Deliberately restrained
 * otherwise: no shadow, one radius step.
 */
export default function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`border-wireframe rounded-lg ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
