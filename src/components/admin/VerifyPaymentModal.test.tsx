// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VerifyPaymentModal from "./VerifyPaymentModal";
import type { AdminPurchaseRow } from "@/lib/db";

const row: AdminPurchaseRow = {
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

function jsonResponse(data: unknown, status = 200) {
  return { ok: status < 400, status, json: async () => data } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("VerifyPaymentModal", () => {
  it("opens showing the reference and expected amount due", () => {
    render(
      <VerifyPaymentModal purchase={row} onClose={() => {}} onVerified={() => {}} />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Verify EFT payment")).toBeInTheDocument();
    expect(screen.getByText("WT-415033")).toBeInTheDocument();
    expect(screen.getByText("R 450,00")).toBeInTheDocument();
  });

  it("shows the mismatch message with expected/received/outstanding when the amounts don't match", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse(
        {
          error: "Payment does not match the amount due.",
          expectedMinor: 45000,
          receivedMinor: 1000,
          outstandingMinor: 44000,
          overpaymentMinor: 0,
        },
        409,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <VerifyPaymentModal purchase={row} onClose={() => {}} onVerified={() => {}} />,
    );

    await user.type(screen.getByLabelText("Amount actually received"), "10.00");
    await user.click(screen.getByRole("button", { name: "Verify payment" }));

    await waitFor(() =>
      expect(screen.getByText("Payment does not match")).toBeInTheDocument(),
    );
    expect(screen.getByText("Expected: R 450,00")).toBeInTheDocument();
    expect(screen.getByText("Received: R 10,00")).toBeInTheDocument();
    expect(screen.getByText("Outstanding: R 440,00")).toBeInTheDocument();
    expect(
      screen.getByText("This booking remains awaiting payment."),
    ).toBeInTheDocument();

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init!.body as string)).toEqual({
      reference: "WDLB-abc",
      receivedAmount: "10.00",
    });

    // the primary action now reads "Try again" - never implying the
    // mismatched amount could somehow be overridden instead of retried
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Verify payment" }),
    ).not.toBeInTheDocument();
  });

  it("shows an overpayment message instead of outstanding when received exceeds expected", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          {
            expectedMinor: 45000,
            receivedMinor: 50000,
            outstandingMinor: 0,
            overpaymentMinor: 5000,
          },
          409,
        ),
      ),
    );
    const user = userEvent.setup();

    render(
      <VerifyPaymentModal purchase={row} onClose={() => {}} onVerified={() => {}} />,
    );
    await user.type(screen.getByLabelText("Amount actually received"), "500.00");
    await user.click(screen.getByRole("button", { name: "Verify payment" }));

    await waitFor(() =>
      expect(screen.getByText("Overpayment: R 50,00")).toBeInTheDocument(),
    );
    expect(screen.queryByText(/^Outstanding:/)).not.toBeInTheDocument();
  });

  it("calls onVerified with the server's purchase on an exact match, without marking it paid client-side", async () => {
    const verifiedPurchase = {
      ...row,
      status: "paid",
      eft_received_amount_minor: 45000,
      verified_at: "2026-08-29T10:00:00.000Z",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ alreadyVerified: false, purchase: verifiedPurchase }),
      ),
    );
    const onVerified = vi.fn();
    const user = userEvent.setup();

    render(
      <VerifyPaymentModal purchase={row} onClose={() => {}} onVerified={onVerified} />,
    );
    await user.type(screen.getByLabelText("Amount actually received"), "450.00");
    await user.click(screen.getByRole("button", { name: "Verify payment" }));

    await waitFor(() =>
      expect(onVerified).toHaveBeenCalledWith(verifiedPurchase, false),
    );
  });
});
