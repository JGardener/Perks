import { render, screen } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

vi.mock("@sentry/react", () => ({ captureException: vi.fn() }));

import * as Sentry from "@sentry/react";

const ThrowOnRender = () => { throw new Error("Boom"); };

beforeEach(() => { vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => { vi.restoreAllMocks(); });

describe("ErrorBoundary", () => {
  it("tab fallback shows compact message without Reload button when child throws", () => {
    render(
      <ErrorBoundary label="Perks">
        <ThrowOnRender />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/something went wrong in the perks tab/i)).not.toBeNull();
    expect(screen.queryByRole("button", { name: /reload/i })).toBeNull();
  });

  it("root fallback shows Reload button and reports to Sentry when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowOnRender />
      </ErrorBoundary>
    );

    expect(screen.queryByRole("button", { name: /reload/i })).not.toBeNull();
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
