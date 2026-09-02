const VARIANT_CLASSES = {
  primary:
    "bg-text-primary text-bg hover:bg-text-secondary",
  secondary:
    "border border-line bg-surface-elevated text-text-primary hover:border-line-strong hover:bg-surface",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-surface-elevated",
};

/**
 * Base interactive button. Always renders a real <button> element for
 * accessibility — never style a <div> as a control.
 */
export default function Button({
  children,
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.secondary;

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
