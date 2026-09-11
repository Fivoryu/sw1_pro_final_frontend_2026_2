import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App HU-007 routing", () => {
  it("opens the public invitation flow without an authenticated session", async () => {
    window.location.hash = "#token=public-token";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ requires_password: false, expires_at: "2030-01-01T00:00:00Z" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    try {
      render(<App />);
      expect(await screen.findByRole("heading", { name: "Aceptar invitación" })).toBeInTheDocument();
      expect(await screen.findByRole("button", { name: "Aceptar invitación" })).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/agent-invitations/inspect",
        expect.objectContaining({ body: JSON.stringify({ token: "public-token" }) }),
      );
      expect(document.body.textContent).not.toContain("public-token");
    } finally {
      fetchMock.mockRestore();
    }
  });
});
