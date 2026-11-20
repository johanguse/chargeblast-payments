import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  // Hooks under test read and write the URL.
  history.replaceState(null, "", "/payments");
});
