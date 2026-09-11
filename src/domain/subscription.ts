const statuses = ["trialing", "active", "past_due", "suspended", "canceled_read_only", "purged"] as const;
export type SubscriptionStatus = (typeof statuses)[number];
const usageFields = ["storage_bytes", "active_properties", "monthly_reconstruction_requests", "storage_bytes_limit", "active_properties_limit", "monthly_reconstruction_requests_limit"] as const;
type UsageField = (typeof usageFields)[number];
export type SubscriptionUsageProjection = Readonly<Record<UsageField, number>>;
type TextProjection = Readonly<Record<"subscription_id" | "plan_id" | "periodo_inicio" | "periodo_fin", string>>;
type NullableProjection = Readonly<Record<"plan_pendiente" | "past_due_at" | "grace_ends_at" | "canceled_at" | "purge_due_at", string | null>>;
export type SubscriptionProjection = TextProjection & NullableProjection & Readonly<{ estado: SubscriptionStatus; usage: SubscriptionUsageProjection }>;
export type SubscriptionLifecycleProjection = SubscriptionProjection;
export class SubscriptionProjectionError extends Error {
  readonly code = "INVALID_PROJECTION";
  constructor() { super("The subscription projection is invalid."); this.name = "SubscriptionProjectionError"; }
}
type ValueMap = Record<string, unknown>;
const fields = ["subscription_id", "plan_id", "estado", "plan_pendiente", "periodo_inicio", "periodo_fin", "past_due_at", "grace_ends_at", "canceled_at", "purge_due_at", "usage"] as const;
const textFields = ["subscription_id", "plan_id", "periodo_inicio", "periodo_fin"];
const nullableFields = ["plan_pendiente", "past_due_at", "grace_ends_at", "canceled_at", "purge_due_at"];
const isRecord = (value: unknown): value is ValueMap => value !== null && typeof value === "object" && !Array.isArray(value);
const hasExactFields = (value: ValueMap, expected: readonly string[]) => Object.keys(value).length === expected.length && expected.every((key) => Object.prototype.hasOwnProperty.call(value, key));
const isText = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const isCount = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;
const invalid = (): never => { throw new SubscriptionProjectionError(); };
export const normalizeSubscriptionProjection = (input: unknown): SubscriptionProjection => {
  if (!isRecord(input) || !hasExactFields(input, fields) || !textFields.every((key) => isText(input[key])) || !nullableFields.every((key) => input[key] === null || isText(input[key])) || !statuses.includes(input.estado as SubscriptionStatus)) return invalid();
  const usage = input.usage;
  if (!isRecord(usage) || !hasExactFields(usage, usageFields) || !usageFields.every((key) => isCount(usage[key]))) return invalid();
  return { ...input, usage: { ...usage } } as SubscriptionProjection;
};
