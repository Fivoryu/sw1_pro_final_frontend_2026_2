import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InMemoryUserRepository } from "../../data/InMemoryUserRepository";
import { demoUsers } from "../../data/fixtures/users";
import { UserManagementService } from "../../application/userManagementService";
import { UserManagementPage } from "./UserManagementPage";

const renderPage = (
  service = new UserManagementService(new InMemoryUserRepository(demoUsers)),
) => render(<UserManagementPage service={service} />);
const fill = async (
  user: ReturnType<typeof userEvent.setup>,
  values = {
    name: "Nuevo",
    email: "nuevo@test",
    role: "visitor",
    status: "pending",
  },
) => {
  await user.clear(screen.getByLabelText(/^Nombre/));
  await user.type(screen.getByLabelText(/^Nombre/), values.name);
  await user.clear(screen.getByLabelText(/^Correo/));
  await user.type(screen.getByLabelText(/^Correo/), values.email);
  await user.clear(screen.getByLabelText(/^Rol/));
  await user.type(screen.getByLabelText(/^Rol/), values.role);
  await user.clear(screen.getByLabelText(/^Estado/));
  await user.type(screen.getByLabelText(/^Estado/), values.status);
};

describe("UserManagementPage", () => {
  it("shows HU-03, local scope, and the initial four-field records", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Cargando usuarios…")).toBeInTheDocument();
    expect(await screen.findByText("Ana Torres")).toBeInTheDocument();
    expect(
      screen.getByText(/Datos locales de demostración/),
    ).toBeInTheDocument();
    expect(screen.getByText("ana@example.test")).toBeInTheDocument();
    expect(screen.getByText(/demo-operator/)).toBeInTheDocument();
    expect(
      screen.queryByText(/verificaci[oó]n de correo/i),
    ).not.toBeInTheDocument();
    screen.getByLabelText(/^Nombre/).focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText(/^Correo/));
  });

  it("validates missing fields and creates a valid user with confirmation", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Ana Torres");
    await user.click(screen.getByRole("button", { name: "Crear usuario" }));
    expect(screen.getAllByRole("alert")).toHaveLength(4);
    expect(screen.getByLabelText(/^Nombre/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(/^Correo/)).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByLabelText(/^Correo/)).toHaveAttribute(
      "aria-describedby",
      "email-error",
    );
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Crear usuario" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Usuario creado correctamente.",
    );
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
  });

  it("edits without duplicating, supports cancel, and deactivates non-destructively", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Ana Torres");
    await user.click(screen.getByRole("button", { name: "Editar Ana Torres" }));
    expect(
      screen.getByRole("heading", { name: "Editar usuario" }),
    ).toBeInTheDocument();
    await user.clear(screen.getByLabelText(/^Nombre/));
    await user.type(screen.getByLabelText(/^Nombre/), "Ana Editada");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText("Ana Torres")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Editar Ana Torres" }));
    await user.clear(screen.getByLabelText(/^Nombre/));
    await user.type(screen.getByLabelText(/^Nombre/), "Ana Editada");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(
      await screen.findByText("Usuario actualizado correctamente."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    await user.click(
      screen.getByRole("button", { name: "Desactivar Ana Editada" }),
    );
    expect(
      await screen.findByText(/permanece disponible como inactivo/),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("listitem", { name: /Ana Editada/ })).getByText(
        "Inactivo",
      ),
    ).toBeInTheDocument();
  });

  it("shows initial load errors and retries locally", async () => {
    let attempts = 0;
    const service = {
      listUsers: vi.fn(() =>
        attempts++
          ? Promise.resolve(demoUsers)
          : Promise.reject(new Error("offline")),
      ),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deactivateUser: vi.fn(),
    } as unknown as UserManagementService;
    renderPage(service);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar la lista local.",
    );
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Reintentar" }));
    expect(
      await screen.findByRole("heading", { name: "Ana Torres" }),
    ).toBeInTheDocument();
  });

  it("keeps the draft and reports a controlled mutation error", async () => {
    const service = {
      listUsers: vi.fn(async () => demoUsers),
      createUser: vi.fn(async () => {
        throw new Error("controlled");
      }),
      updateUser: vi.fn(),
      deactivateUser: vi.fn(),
    } as unknown as UserManagementService;
    const user = userEvent.setup();
    renderPage(service);
    await screen.findByText("Ana Torres");
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Crear usuario" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo completar la operación local.",
    );
    expect(screen.getByLabelText(/^Nombre/)).toHaveValue("Nuevo");
  });
});
