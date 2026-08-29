// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import EftReference from "./EftReference";

describe("EftReference", () => {
  it("renders a real reference as a code-styled value", () => {
    render(<EftReference value="WT-415033" />);
    const el = screen.getByText("WT-415033");
    expect(el).toHaveClass("font-mono");
  });

  it("shows plain 'No reference' text for a legacy booking with none, never fabricating one", () => {
    render(<EftReference value={null} />);
    const el = screen.getByText("No reference");
    expect(el).not.toHaveClass("font-mono");
    expect(el).toHaveClass("italic");
  });
});
