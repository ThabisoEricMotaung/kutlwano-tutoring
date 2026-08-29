import Image from "next/image";

export default function AdminHeader() {
  return (
    <div className="flex items-center justify-between gap-4 pb-6 border-b border-line">
      <div className="flex items-center gap-3">
        <Image
          src="/Images/wanotuts-logo.svg"
          alt="WanoTuts"
          width={578}
          height={100}
          className="h-8 w-auto"
        />
        <span className="hidden sm:inline text-text-muted">·</span>
        <span className="hidden sm:inline font-semibold text-text-muted">
          Payments
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-bold"
        >
          KS
        </span>
        <span className="hidden md:inline text-sm text-text-muted">
          Signed in as admin
        </span>
        <form method="post" action="/api/admin/logout">
          <button
            type="submit"
            className="text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
