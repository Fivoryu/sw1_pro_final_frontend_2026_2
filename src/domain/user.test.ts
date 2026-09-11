import { describe, expect, it } from "vitest";
import { normalizeUserDraft, validateUserDraft, type UserDraft } from "./user";

const complete: UserDraft = {
  name: " Ada ",
  email: " ada@example.test ",
  role: " analyst ",
  status: " active ",
};

describe("user draft rules", () => {
  it("reports every required field that is empty after trimming", () => {
    expect(
      validateUserDraft({ name: " ", email: "", role: "\t", status: "  " }),
    ).toEqual({
      name: "El nombre es obligatorio",
      email: "El correo es obligatorio",
      role: "El rol es obligatorio",
      status: "El estado es obligatorio",
    });
  });

  it("trims values without imposing email, role, or status catalogs", () => {
    expect(normalizeUserDraft(complete)).toEqual({
      name: "Ada",
      email: "ada@example.test",
      role: "analyst",
      status: "active",
    });
    expect(
      validateUserDraft({ ...complete, email: "same@example.test" }),
    ).toEqual({});
  });
});
