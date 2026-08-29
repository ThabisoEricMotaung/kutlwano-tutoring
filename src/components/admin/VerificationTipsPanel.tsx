const TIPS = [
  "Confirm the EFT in the bank account.",
  "Match the payment reference.",
  "Match the amount received.",
  "Then verify the payment.",
];

export default function VerificationTipsPanel() {
  return (
    <div className="bg-soft border border-line rounded-xl p-5">
      <h2 className="font-display text-lg font-bold mb-3">
        Verification tips
      </h2>
      <ol className="space-y-2 text-sm text-text-muted list-decimal list-inside">
        {TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ol>
    </div>
  );
}
