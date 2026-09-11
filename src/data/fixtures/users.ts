import type { User } from "../../domain/user";

export const demoUsers: readonly User[] = [
  {
    id: "demo-1",
    name: "Ana Torres",
    email: "ana@example.test",
    role: "demo-operator",
    status: "active",
  },
  {
    id: "demo-2",
    name: "Bruno Silva",
    email: "bruno@example.test",
    role: "reviewer",
    status: "active",
  },
];
