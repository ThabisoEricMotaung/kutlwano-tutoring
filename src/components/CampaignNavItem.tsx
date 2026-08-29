"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FESTIVE_OFFER, isCampaignPublished } from "@/lib/festive-offer";

export default function CampaignNavItem() {
  const pathname = usePathname();
  if (!isCampaignPublished()) return null;
  const active =
    pathname === FESTIVE_OFFER.campaign.url ||
    pathname.startsWith(`${FESTIVE_OFFER.campaign.url}/`);
  return (
    <Link
      href={FESTIVE_OFFER.campaign.url}
      aria-current={active ? "page" : undefined}
      className={`group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11.5px] font-bold tracking-[0.07em] uppercase shadow-sm transition-[background-color,color,border-color,transform,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8872d] ${active ? "border-[#b8872d] bg-[#0b3e31] text-white ring-2 ring-[#e4c675]/45" : "border-[#c49a45] bg-primary text-white hover:-translate-y-0.5 hover:border-[#e0bd68] hover:bg-[#123f34] hover:shadow-md"}`}
    >
      <span
        aria-hidden="true"
        className="text-[#f2cf77] transition-transform duration-200 group-hover:rotate-12"
      >
        ✦
      </span>
      <span>{FESTIVE_OFFER.campaign.label}</span>
    </Link>
  );
}
