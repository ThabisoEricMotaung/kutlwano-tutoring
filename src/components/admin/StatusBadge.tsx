// Reuses the site's existing restrained-gold tone (see the "offer has ended"
// panel on /festive-special) for pending states, and the WanoTuts green for
// verified ones. Status is never conveyed by color alone - each badge always
// carries its own text label.
export default function StatusBadge({ status }: { status: string }) {
  if (status === "paid")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-soft border border-primary/30 text-primary text-xs font-semibold px-2.5 py-1">
        <span aria-hidden="true">✓</span> Verified
      </span>
    );
  if (status === "awaiting_payment")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f9f0dd] border border-[#d2ae61] text-[#8a651e] text-xs font-semibold px-2.5 py-1">
        <span aria-hidden="true">●</span> Awaiting payment
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-soft border border-line text-text-muted text-xs font-semibold px-2.5 py-1">
      {status}
    </span>
  );
}
