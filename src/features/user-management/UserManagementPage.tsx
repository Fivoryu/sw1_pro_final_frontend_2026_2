import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  UserManagementService,
  UserValidationError,
} from "../../application/userManagementService";
import {
  INACTIVE_STATUS,
  normalizeUserDraft,
  validateUserDraft,
  type User,
  type UserDraft,
  type UserField,
  type ValidationErrors,
} from "../../domain/user";

const emptyDraft = (): UserDraft => ({
  name: "",
  email: "",
  role: "",
  status: "",
});
const fields: Array<{ key: UserField; label: string; type?: string }> = [
  { key: "name", label: "Nombre" },
  { key: "email", label: "Correo" },
  { key: "role", label: "Rol" },
  { key: "status", label: "Estado" },
];

export function UserManagementPage({
  service,
}: {
  service: UserManagementService;
}) {
  const [users, setUsers] = useState<readonly User[]>([]);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);
  const [selectedId, setSelectedId] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [operationError, setOperationError] = useState("");
  const [message, setMessage] = useState("");
  const refs = useRef<Record<UserField, HTMLInputElement | null>>({
    name: null,
    email: null,
    role: null,
    status: null,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setUsers(await service.listUsers());
      return true;
    } catch {
      setLoadError(true);
      return false;
    } finally {
      setLoading(false);
    }
  }, [service]);
  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const resetForm = () => {
    setDraft(emptyDraft());
    setSelectedId(undefined);
    setFieldErrors({});
  };
  const change = (field: UserField, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setOperationError("");
    const normalized = normalizeUserDraft(draft);
    setDraft(normalized);
    const errors = validateUserDraft(normalized);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      refs.current[Object.keys(errors)[0] as UserField]?.focus();
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      if (selectedId) await service.updateUser(selectedId, normalized);
      else await service.createUser(normalized);
      if (await loadUsers()) {
        resetForm();
        setMessage(
          selectedId
            ? "Usuario actualizado correctamente."
            : "Usuario creado correctamente.",
        );
      }
    } catch (error) {
      if (error instanceof UserValidationError) setFieldErrors(error.errors);
      else
        setOperationError(
          "No se pudo completar la operación local. Revise los datos e intente nuevamente.",
        );
    } finally {
      setSaving(false);
    }
  };
  const edit = (user: User) => {
    setDraft({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setSelectedId(user.id);
    setFieldErrors({});
    setOperationError("");
    setMessage("");
  };
  const deactivate = async (id: string) => {
    setSaving(true);
    setMessage("");
    setOperationError("");
    try {
      await service.deactivateUser(id);
      if (await loadUsers())
        setMessage(
          "Usuario desactivado. El registro permanece disponible como inactivo.",
        );
    } catch {
      setOperationError(
        "No se pudo completar la operación local. Revise los datos e intente nuevamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page" aria-busy={loading || saving}>
      <header className="page-header">
        <p className="eyebrow">Superficie administrativa local</p>
        <h1>HU-03 — Gestión de usuarios</h1>
        <p>
          Consulta, alta, edición y desactivación de registros de demostración.
        </p>
      </header>
      <p className="local-notice" role="note">
        <strong>Datos locales de demostración.</strong> Se reinician al
        recargar; no representan persistencia, usuarios reales ni control de
        acceso real.
      </p>
      {loadError ? (
        <div className="feedback error" role="alert">
          No se pudo cargar la lista local.
          <button type="button" onClick={() => void loadUsers()}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="workspace">
          <section className="card" aria-labelledby="form-title">
            <h2 id="form-title">
              {selectedId ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <form onSubmit={submit} noValidate>
              {fields.map(({ key, label }) => {
                const error = fieldErrors[key];
                const errorId = `${key}-error`;
                return (
                  <div className="field" key={key}>
                    <label htmlFor={key}>
                      {label}
                      <span aria-hidden="true"> *</span>
                    </label>
                    <input
                      ref={(element) => {
                        refs.current[key] = element;
                      }}
                      id={key}
                      name={key}
                      value={draft[key]}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? errorId : undefined}
                      inputMode={key === "email" ? "email" : undefined}
                      autoComplete={key === "email" ? "email" : "off"}
                      onChange={(event) => change(key, event.target.value)}
                    />
                    {error && (
                      <p className="field-error" id={errorId} role="alert">
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
              <div className="actions">
                <button className="primary" type="submit" disabled={saving}>
                  {selectedId ? "Guardar cambios" : "Crear usuario"}
                </button>
                {selectedId && (
                  <button type="button" onClick={resetForm} disabled={saving}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>
          <section className="card" aria-labelledby="list-title">
            <h2 id="list-title">Usuarios disponibles</h2>
            {loading ? (
              <p role="status">Cargando usuarios…</p>
            ) : (
              <ul className="user-list">
                {users.map((user) => (
                  <li key={user.id} aria-label={`${user.name} — ${user.email}`}>
                    <article>
                      <div>
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                        <p>
                          <span>Rol:</span> {user.role} · <span>Estado:</span>{" "}
                          <strong>
                            {user.status === INACTIVE_STATUS
                              ? "Inactivo"
                              : user.status}
                          </strong>
                        </p>
                      </div>
                      <div className="actions">
                        <button
                          type="button"
                          onClick={() => edit(user)}
                          disabled={saving}
                        >
                          Editar {user.name}
                        </button>
                        {user.status !== INACTIVE_STATUS && (
                          <button
                            type="button"
                            onClick={() => void deactivate(user.id)}
                            disabled={saving}
                          >
                            Desactivar {user.name}
                          </button>
                        )}
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
      {message && (
        <p className="feedback success" role="status" aria-live="polite">
          {message}
        </p>
      )}
      {operationError && (
        <p className="feedback error" role="alert">
          {operationError}
        </p>
      )}
    </main>
  );
}
