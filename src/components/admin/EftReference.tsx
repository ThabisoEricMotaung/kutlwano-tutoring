// Never fabricates a reference: a booking with none recorded (e.g. the
// legacy pre-short-reference test row) shows plain, muted "No reference"
// text rather than styling it like a real code value.
export default function EftReference({
  value,
  className = "",
}: {
  value: string | null;
  className?: string;
}) {
  if (!value)
    return (
      <span className={`italic text-text-muted ${className}`}>
        No reference
      </span>
    );
  return (
    <span className={`font-mono font-semibold text-primary ${className}`}>
      {value}
    </span>
  );
}
