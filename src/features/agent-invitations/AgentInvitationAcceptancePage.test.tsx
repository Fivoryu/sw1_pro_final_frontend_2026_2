import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentInvitationAcceptancePage } from "./AgentInvitationAcceptancePage";

const service = (requires_password: boolean) => ({
  inspectInvitation: vi.fn(async () => ({ requires_password, expires_at: "2030-01-01T00:00:00Z" })),
  acceptInvitation: vi.fn(async () => ({ invitation_status: "accepted" as const, membership_status: "pending" as const, membership_id: "membership" })),
} as never);

describe("AgentInvitationAcceptancePage", () => {
  it("inspects the fragment token in memory and asks for a new password", async () => {
    window.location.hash = "#token=private-token";
    const api = service(true);
    render(<AgentInvitationAcceptancePage service={api} />);
    expect(await screen.findByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("private-token");
    await userEvent.setup().type(screen.getByLabelText("Contraseña"), "password123");
    await userEvent.setup().type(screen.getByLabelText("Confirmar contraseña"), "password123");
    await userEvent.setup().click(screen.getByRole("button", { name: "Aceptar invitación" }));
    expect(api.acceptInvitation).toHaveBeenCalledWith("private-token", "password123", "password123");
    expect(await screen.findByRole("status")).toHaveTextContent("membresía queda pendiente");
  });

  it("does not request credentials for an existing global account", async () => {
    window.location.hash = "#token=existing-token";
    render(<AgentInvitationAcceptancePage service={service(false)} />);
    expect(await screen.findByRole("button", { name: "Aceptar invitación" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
  });
});
