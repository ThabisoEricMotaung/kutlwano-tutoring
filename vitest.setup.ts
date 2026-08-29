import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Our test files import afterEach/etc. explicitly rather than relying on
// vitest's `globals: true`, so @testing-library/react's own automatic
// afterEach-based cleanup never registers - do it here instead, once, for
// every test file (a no-op for files that never render anything).
afterEach(() => {
  cleanup();
});

// jsdom does not implement <dialog>'s modal behavior - polyfill just enough
// (open attribute + a "close" event) for component tests that use it.
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
