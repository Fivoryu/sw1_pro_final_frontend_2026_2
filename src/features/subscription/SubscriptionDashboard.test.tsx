import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SubscriptionProjection } from "../../domain/subscription";
import { SubscriptionDashboard } from "./SubscriptionDashboard";
const projection: SubscriptionProjection = {
  subscription_id: "sub-1",
  plan_id: "plan-1",
  estado: "active",
  plan_pendiente: "plan-2",
  periodo_inicio: "2030-01-01T00:00:00Z",
  periodo_fin: "2030-02-01T00:00:00Z",
  past_due_at: null,
  grace_ends_at: null,
  canceled_at: null,
  purge_due_at: null,
  usage: {
    storage_bytes: 1,
    active_properties: 2,
    monthly_reconstruction_requests: 3,
    storage_bytes_limit: 10,
    active_properties_limit: 20,
    monthly_reconstruction_requests_limit: 30,
  },
};
const service = (getSubscription = vi.fn(async () => projection)) => ({
  getSubscription,
  changePlan: vi.fn(async () => projection),
  cancel: vi.fn(async () => projection),
  reactivate: vi.fn(async () => projection),
});
describe("SubscriptionDashboard", () => {
  it("renders projection, usage and lifecycle actions after loading", async () => {
    const api = service();
    render(<SubscriptionDashboard service={api} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando suscripción",
    );
    expect(await screen.findByText("plan-1")).toBeInTheDocument();
    expect(screen.getByText("plan-2")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText(/Almacenamiento:.*1.*10/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cambiar plan" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Cancelar suscripción" }),
    ).toBeEnabled();
  });
  it("reports load errors and retries", async () => {
    const getSubscription = vi
      .fn()
      .mockRejectedValueOnce(new Error("secret"))
      .mockResolvedValue(projection);
    render(<SubscriptionDashboard service={service(getSubscription)} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar la suscripción",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("secret");
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("plan-1")).toBeInTheDocument();
  });
  it("distinguishes an absent session from an unavailable subscription", async () => {
    const getSubscription = vi.fn().mockRejectedValue({ code: "NO_SESSION" });
    render(<SubscriptionDashboard service={service(getSubscription)} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No hay una sesión activa.",
    );
  });
  it.each(["trialing", "canceled_read_only", "purged"] as const)(
    "gates actions in %s",
    async (estado) => {
      render(
        <SubscriptionDashboard
          service={service(
            vi.fn(async () => ({
              ...projection,
              estado,
              plan_pendiente: null,
            })),
          )}
        />,
      );
      await screen.findByText(estado);
      expect(
        screen.queryByRole("button", { name: "Cambiar plan" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Cancelar suscripción" }),
      ).not.toBeInTheDocument();
    },
  );
  it("updates only after a lifecycle action succeeds", async () => {
    const api = service();
    let resolve!: (value: SubscriptionProjection) => void;
    api.cancel = vi.fn(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    render(<SubscriptionDashboard service={api} />);
    await screen.findByText("active");
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Cancelar suscripción" }));
    expect(screen.getByText("active")).toBeInTheDocument();
    resolve({
      ...projection,
      estado: "canceled_read_only",
      plan_pendiente: null,
      purge_due_at: "2030-02-01T00:00:00Z",
    });
    expect(await screen.findByText("canceled_read_only")).toBeInTheDocument();
  });
});
