/**
 * Settings lists (admin Phase 5)  →  /api/settings/{weight-classes,venues,bout-rules,glove-brands,associations}
 *
 *   GET    /settings/<list>        public: active entries in order; ?all=1 with a KKF staff token adds inactive ones
 *   POST   /settings/<list>        Super Admin → 201
 *   PUT    /settings/<list>/:id    Super Admin (any field, plus sortOrder and active)
 *   DELETE /settings/<list>/:id    Super Admin
 *
 * Records elsewhere copy the value (events.location, matches.glove_brand, …), so
 * editing or deleting an entry never changes existing events or bouts.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import { Role, STAFF, hasRole, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now } from "../../lib/dates.ts";
import { HttpError, deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { type Input, inputOf, isTruthy } from "../../lib/input.ts";

type Row = Record<string, any>;
type Fields = Record<string, unknown>;

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

/** Reads optional fields; `required` keys must be present on create. */
function text(input: Input, data: Fields, key: string, column: string, max: number) {
  if (!input.present(key)) return;
  const value = input.get<string>(key);
  if (value !== null && String(value).length > max) throw new HttpError(422, `The ${key} may not be longer than ${max} characters`);
  data[column] = value === null ? null : String(value);
}

function number(input: Input, data: Fields, key: string, column: string, min: number, max: number, integer = false) {
  if (!input.present(key)) return;
  const raw = input.get(key);
  if (raw === null) {
    data[column] = null;
    return;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw new HttpError(422, `The ${key} must be ${integer ? "a whole number" : "a number"} between ${min} and ${max}`);
  }
  data[column] = value;
}

interface ListConfig {
  path: string;
  label: string;
  delegate: () => any;
  /** Input keys that must be sent (non-empty) on create. */
  required: string[];
  /** Columns that can't be null after a change. */
  notNull: string[];
  fields: (input: Input) => Fields;
  /** Cross-field checks on the merged row. */
  check?: (row: Row) => void;
  toRow: (r: Row) => Row;
}

const common = (r: Row) => ({ sort_order: r.sort_order, active: r.active, created_at: micro(r.created_at), updated_at: micro(r.updated_at) });

export const LISTS: ListConfig[] = [
  {
    path: "weight-classes",
    label: "Weight class",
    delegate: () => prisma.weightClass,
    required: ["name"],
    notNull: ["name"],
    fields: (input) => {
      const data: Fields = {};
      text(input, data, "name", "name", 100);
      text(input, data, "nameKhmer", "name_khmer", 100);
      number(input, data, "minKg", "min_kg", 0, 300);
      number(input, data, "maxKg", "max_kg", 0, 300);
      return data;
    },
    check: (row) => {
      if (row.min_kg == null && row.max_kg == null) throw new HttpError(422, "Give a minimum or maximum weight (or both)");
      if (row.min_kg != null && row.max_kg != null && Number(row.min_kg) > Number(row.max_kg)) {
        throw new HttpError(422, "The minimum weight can't be above the maximum");
      }
    },
    toRow: (r) => ({ id: r.id, name: r.name, name_khmer: r.name_khmer, min_kg: num(r.min_kg), max_kg: num(r.max_kg), ...common(r) }),
  },
  {
    path: "venues",
    label: "Venue",
    delegate: () => prisma.venue,
    required: ["name"],
    notNull: ["name"],
    fields: (input) => {
      const data: Fields = {};
      text(input, data, "name", "name", 255);
      text(input, data, "nameKhmer", "name_khmer", 255);
      text(input, data, "region", "region", 255);
      text(input, data, "regionKhmer", "region_khmer", 255);
      text(input, data, "description", "description", 2000);
      number(input, data, "latitude", "latitude", -90, 90);
      number(input, data, "longitude", "longitude", -180, 180);
      return data;
    },
    check: (row) => {
      if ((row.latitude == null) !== (row.longitude == null)) throw new HttpError(422, "Give both latitude and longitude, or neither");
    },
    toRow: (r) => ({
      id: r.id, name: r.name, name_khmer: r.name_khmer, region: r.region, region_khmer: r.region_khmer, description: r.description,
      latitude: num(r.latitude), longitude: num(r.longitude), ...common(r),
    }),
  },
  {
    path: "bout-rules",
    label: "Bout rule",
    delegate: () => prisma.boutRule,
    required: ["name", "rounds", "roundTime", "knockdownLimit"],
    notNull: ["name", "rounds", "round_time", "knockdown_limit"],
    fields: (input) => {
      const data: Fields = {};
      text(input, data, "name", "name", 255);
      text(input, data, "nameKhmer", "name_khmer", 255);
      number(input, data, "rounds", "rounds", 1, 12, true);
      number(input, data, "roundTime", "round_time", 1, 5, true);
      number(input, data, "knockdownLimit", "knockdown_limit", 0, 10, true);
      text(input, data, "gloveSize", "glove_size", 10);
      return data;
    },
    toRow: (r) => ({
      id: r.id, name: r.name, name_khmer: r.name_khmer, rounds: r.rounds, round_time: r.round_time,
      knockdown_limit: r.knockdown_limit, glove_size: r.glove_size, ...common(r),
    }),
  },
  {
    path: "glove-brands",
    label: "Glove brand",
    delegate: () => prisma.gloveBrand,
    required: ["brand"],
    notNull: ["brand"],
    fields: (input) => {
      const data: Fields = {};
      text(input, data, "brand", "brand", 255);
      text(input, data, "model", "model", 255);
      return data;
    },
    toRow: (r) => ({ id: r.id, brand: r.brand, model: r.model, ...common(r) }),
  },
  {
    path: "associations",
    label: "Association",
    delegate: () => prisma.association,
    required: ["name"],
    notNull: ["name"],
    fields: (input) => {
      const data: Fields = {};
      text(input, data, "name", "name", 255);
      text(input, data, "nameKhmer", "name_khmer", 255);
      return data;
    },
    toRow: (r) => ({ id: r.id, name: r.name, name_khmer: r.name_khmer, ...common(r) }),
  },
];

const ORDER = [{ sort_order: "asc" }, { created_at: { sort: "asc", nulls: "first" } }] as const;

/** Fields every list shares: position and whether it's offered in forms. */
function commonFields(input: Input, data: Fields) {
  number(input, data, "sortOrder", "sort_order", 0, 100000, true);
  if (input.has("active")) data.active = isTruthy(input.get("active"));
}

function checkNotNull(list: ListConfig, data: Fields) {
  for (const column of list.notNull) {
    if (column in data && data[column] === null) throw new HttpError(422, `The ${column.replace(/_/g, " ")} can't be empty`);
  }
}

export default async function settingsListRoutes(app: FastifyInstance) {
  for (const list of LISTS) {
    const base = `/settings/${list.path}`;

    app.get(base, async (request, reply) => {
      const { all } = request.query as { all?: string };
      const withInactive = isTruthy(all) && hasRole(request.user ?? null, STAFF);
      const rows = await list.delegate().findMany({ where: withInactive ? {} : { active: true }, orderBy: ORDER });
      return ok(reply, rows.map(list.toRow));
    });

    app.register(async (protectedRoutes) => {
      protectedRoutes.addHook("preHandler", requireAuth);

      protectedRoutes.post(base, async (request, reply) => {
        requireRole(request, [Role.SuperAdmin]);
        const input = inputOf(request.body);
        for (const key of list.required) input.required(key);
        const data = list.fields(input);
        commonFields(input, data);
        checkNotNull(list, data);
        list.check?.(data);
        if (data.sort_order === undefined) {
          const last = await list.delegate().aggregate({ _max: { sort_order: true } });
          data.sort_order = (last._max.sort_order ?? -1) + 1;
        }
        const at = now();
        const row = await list.delegate().create({ data: { id: randomUUID(), ...data, created_at: at, updated_at: at } });
        return ok(reply, list.toRow(row), 201);
      });

      protectedRoutes.put(`${base}/:id`, async (request, reply) => {
        requireRole(request, [Role.SuperAdmin]);
        const id = idParam(request.params, list.label);
        const existing = await list.delegate().findUnique({ where: { id } });
        if (!existing) throw notFound(list.label);
        const input = inputOf(request.body);
        const data = list.fields(input);
        commonFields(input, data);
        checkNotNull(list, data);
        list.check?.({ ...existing, ...data });
        if (Object.keys(data).length > 0) data.updated_at = now();
        return ok(reply, list.toRow(await list.delegate().update({ where: { id }, data })));
      });

      protectedRoutes.delete(`${base}/:id`, async (request, reply) => {
        requireRole(request, [Role.SuperAdmin]);
        const id = idParam(request.params, list.label);
        const existing = await list.delegate().findUnique({ where: { id } });
        if (!existing) throw notFound(list.label);
        await list.delegate().delete({ where: { id } });
        return deleted(reply, `${list.label} deleted successfully`, list.toRow(existing));
      });
    });
  }
}
