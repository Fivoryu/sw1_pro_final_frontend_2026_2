import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";
const session = () => ({ login: vi.fn(async () => undefined) });
const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Correo"), "admin@test");
  await user.type(screen.getByLabelText("Contraseña"), "secret");
};
describe("LoginPage", () => {
  it("submits controlled credentials and hands off after success", async () => {
    const user = userEvent.setup(),
      service = session(),
      onAuthenticated = vi.fn();
    render(<LoginPage session={service} onAuthenticated={onAuthenticated} />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(service.login).toHaveBeenCalledWith({
      correo: "admin@test",
      password: "secret",
    });
    expect(onAuthenticated).toHaveBeenCalledTimes(1);
  });
  it("shows loading, safe error, and retries without exposing the failure", async () => {
    const user = userEvent.setup(),
      service = session();
    let release!: (value?: undefined) => void;
    service.login.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    render(<LoginPage session={service} onAuthenticated={vi.fn()} />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(screen.getByRole("status")).toHaveTextContent("Iniciando sesión");
    release();
    await screen.findByRole("button", { name: "Ingresar" });
    service.login.mockRejectedValueOnce(new Error("server-secret"));
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo iniciar sesión",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("server-secret");
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(service.login).toHaveBeenCalledTimes(3);
  });
});
