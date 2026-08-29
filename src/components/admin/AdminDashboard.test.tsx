// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "./AdminDashboard";
import type { AdminPurchaseRow } from "@/lib/db";

const awaitingRow: AdminPurchaseRow = {
  reference: "WDLB-abc",
  eft_payment_reference: "WT-415033",
  customer_name: "Test Customer",
  email: "customer@example.com",
  telephone: "0712345678",
  package_id: "south_africa",
  subject: "Mathematics",
  currency: "ZAR",
  display_amount_minor: 45000,
  charged_zar_minor: 45000,
  eft_received_amount_minor: null,
  status: "awaiting_payment",
  payment_method: "eft",
  created_at: "2026-08-29T09:00:00.000Z",
  verified_at: null,
};

const verifiedRow: AdminPurchaseRow = {
  ...awaitingRow,
  status: "paid",
  eft_received_amount_minor: 45000,
  verified_at: "2026-08-29T10:00:00.000Z",
};

function jsonResponse(data: unknown, status = 200) {
  return { ok: status < 400, status, json: async () => data } as Response;
}

function makeFetchMock({ verifyResult }: { verifyResult?: unknown } = {}) {
  let verified = false;
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.startsWith("/api/admin/summary")) {
      return jsonResponse({
        awaitingCount: verified ? 0 : 1,
        awaitingTotalMinor: verified ? 0 : 45000,
        verifiedThisMonthCount: verified ? 1 : 0,
        verifiedThisMonthTotalMinor: verified ? 45000 : 0,
      });
    }

    if (url.startsWith("/api/admin/verify-payment")) {
      const body = JSON.parse((init!.body as string) || "{}");
      if (verifyResult) return jsonResponse(verifyResult, 409);
      if (body.receivedAmount === "450.00") {
        verified = true;
        return jsonResponse({ alreadyVerified: false, purchase: verifiedRow });
      }
      return jsonResponse(
        {
          error: "Payment does not match the amount due.",
          expectedMinor: 45000,
          receivedMinor: 1000,
          outstandingMinor: 44000,
          overpaymentMinor: 0,
        },
        409,
      );
    }

    if (url.startsWith("/api/admin/purchases")) {
      const params = new URL(url, "http://localhost").searchParams;
      const view = params.get("view");
      const q = params.get("q");
      if (view === "verified")
        return jsonResponse({ purchases: verified ? [verifiedRow] : [], view });
      if (view === "all")
        return jsonResponse({
          purchases: verified ? [verifiedRow] : [awaitingRow],
          view,
        });
      if (q === "no-match")
        return jsonResponse({ purchases: [], view: "awaiting" });
      return jsonResponse({
        purchases: verified ? [] : [awaitingRow],
        view: "awaiting",
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AdminDashboard", () => {
  it("defaults to the Awaiting tab and shows the initial purchases passed from the server", () => {
    render(
      <AdminDashboard initialPurchases={[awaitingRow]} initialSummary={null} />,
    );

    expect(screen.getByRole("tab", { name: "Awaiting" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getAllByText("WT-415033").length).toBeGreaterThan(0);
  });

  it("switching to the Verified tab fetches and shows paid EFT bookings", async () => {
    vi.stubGlobal("fetch", makeFetchMock());
    const user = userEvent.setup();

    render(
      <AdminDashboard initialPurchases={[awaitingRow]} initialSummary={null} />,
    );
    await user.click(screen.getByRole("tab", { name: "Verified" }));

    await waitFor(() =>
      expect(
        screen.getAllByText("No matching EFT bookings.").length,
      ).toBeGreaterThan(0),
    );
  });

  it("switching to the All tab requests the all view", async () => {
    const fetchMock = makeFetchMock();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <AdminDashboard initialPurchases={[awaitingRow]} initialSummary={null} />,
    );
    await user.click(screen.getByRole("tab", { name: "All" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("view=all"),
      ),
    );
  });

  it("searching filters the list via the existing search query parameter", async () => {
    const fetchMock = makeFetchMock();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <AdminDashboard initialPurchases={[awaitingRow]} initialSummary={null} />,
    );
    await user.type(
      screen.getByPlaceholderText(
        "Search by EFT reference, booking reference, name or email",
      ),
      "no-match",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() =>
      expect(
        screen.getAllByText("No matching EFT bookings.").length,
      ).toBeGreaterThan(0),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("q=no-match"),
    );
  });

  it("clicking Verify payment opens the modal showing the expected amount", async () => {
    vi.stubGlobal("fetch", makeFetchMock());
    const user = userEvent.setup();

    render(
      <AdminDashboard initialPurchases={[awaitingRow]} initialSummary={null} />,
    );
    await user.click(
      within(screen.getByRole("table")).getByRole("button", {
        name: "Verify payment",
      }),
    );

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Verify EFT payment")).toBeInTheDocument();
    expect(within(dialog).getByText("R 450,00")).toBeInTheDocument();
  });

  it("shows the mismatch message and keeps the booking awaiting when the amount is wrong", async () => {
    vi.stubGlobal("fetch", makeFetchMock());
    const user = userEvent.setup();

    render(
      <AdminDashboard initialPurchases={[awaitingRow]} initialSummary={null} />,
    );
    await user.click(
      within(screen.getByRole("table")).getByRole("button", {
        name: "Verify payment",
      }),
    );
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Amount actually received"),
      "10.00",
    );
    await user.click(within(dialog).getByRole("button", { name: "Verify payment" }));

    await waitFor(() =>
      expect(within(dialog).getByText("Payment does not match")).toBeInTheDocument(),
    );
    expect(within(dialog).getByText("Outstanding: R 440,00")).toBeInTheDocument();
    // the row is still shown as awaiting - nothing was marked paid
    expect(screen.getAllByText("Awaiting payment").length).toBeGreaterThan(0);
  });

  it("on an exact match, shows a success message naming the reference and offers to view it in Verified", async () => {
    vi.stubGlobal("fetch", makeFetchMock());
    const user = userEvent.setup();

    render(
      <AdminDashboard initialPurchases={[awaitingRow]} initialSummary={null} />,
    );
    await user.click(
      within(screen.getByRole("table")).getByRole("button", {
        name: "Verify payment",
      }),
    );
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Amount actually received"),
      "450.00",
    );
    await user.click(within(dialog).getByRole("button", { name: "Verify payment" }));

    await waitFor(() =>
      expect(
        screen.getByText("Payment WT-415033 verified successfully.", {
          exact: false,
        }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "View in Verified" })).toBeInTheDocument();
  });

  it("the verified row is visible in the Verified tab after clicking View in Verified", async () => {
    vi.stubGlobal("fetch", makeFetchMock());
    const user = userEvent.setup();

    render(
      <AdminDashboard initialPurchases={[awaitingRow]} initialSummary={null} />,
    );
    await user.click(
      within(screen.getByRole("table")).getByRole("button", {
        name: "Verify payment",
      }),
    );
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Amount actually received"),
      "450.00",
    );
    await user.click(within(dialog).getByRole("button", { name: "Verify payment" }));
    await waitFor(() =>
      screen.getByRole("button", { name: "View in Verified" }),
    );

    await user.click(screen.getByRole("button", { name: "View in Verified" }));

    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Verified" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    expect(screen.getAllByText("R 450,00").length).toBeGreaterThan(0);
  });
});
