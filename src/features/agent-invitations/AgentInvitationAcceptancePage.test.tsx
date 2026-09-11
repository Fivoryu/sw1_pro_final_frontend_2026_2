import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiClientError } from "../../data/apiClient";
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
    expect(document.body.textContent).not.toContain("password123");
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

  it("shows a non-sensitive unavailable state and retries inspection", async () => {
    window.location.hash = "#token=expired-token";
    const api = service(false);
    api.inspectInvitation
      .mockRejectedValueOnce(new ApiClientError("INVITATION_UNAVAILABLE", 410))
      .mockResolvedValueOnce({ requires_password: false, expires_at: "2030-01-01T00:00:00Z" });
    render(<AgentInvitationAcceptancePage service={api} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/no es válido|expiró|reemplazado|utilizado/i);
    expect(screen.queryByText("expired-token")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar validación" }));
    expect(await screen.findByRole("button", { name: "Aceptar invitación" })).toBeInTheDocument();
    expect(api.inspectInvitation).toHaveBeenCalledTimes(2);
  });

  it("keeps the form available and maps an existing membership conflict", async () => {
    window.location.hash = "#token=membership-token";
    const api = service(false);
    api.acceptInvitation.mockRejectedValueOnce(
      new ApiClientError("AGENT_MEMBERSHIP_EXISTS", 409),
    );
    const user = userEvent.setup();
    render(<AgentInvitationAcceptancePage service={api} />);
    await user.click(await screen.findByRole("button", { name: "Aceptar invitación" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/ya pertenece/i);
    expect(screen.queryByText(/membresía queda pendiente/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar aceptación" })).toBeInTheDocument();
  });

  it("blocks a second acceptance while the first request is pending", async () => {
    window.location.hash = "#token=pending-token";
    const api = service(false);
    let resolve: (() => void) | undefined;
    api.acceptInvitation.mockReturnValueOnce(new Promise((done) => { resolve = done; }) as never);
    const user = userEvent.setup();
    render(<AgentInvitationAcceptancePage service={api} />);
    const button = await screen.findByRole("button", { name: "Aceptar invitación" });
    await user.click(button);
    expect(button).toBeDisabled();
    expect(api.acceptInvitation).toHaveBeenCalledTimes(1);
    resolve?.();
    expect(await screen.findByRole("status")).toHaveTextContent(/membresía queda pendiente/i);
  });
});
