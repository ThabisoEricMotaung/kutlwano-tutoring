// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("labels a paid booking as Verified with text, not color alone", () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("labels an awaiting_payment booking with text", () => {
    render(<StatusBadge status="awaiting_payment" />);
    expect(screen.getByText("Awaiting payment")).toBeInTheDocument();
  });

  it("falls back to the raw status text for anything unexpected, rather than a color-only badge", () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText("cancelled")).toBeInTheDocument();
  });
});
