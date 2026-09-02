/** Thin horizontal rule for separating sections within a surface. */
export default function Divider({ className = "" }) {
  return <hr className={`border-t border-line ${className}`} />;
}
