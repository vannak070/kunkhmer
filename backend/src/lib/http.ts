import type { FastifyReply } from "fastify";

/** Error that becomes a `{ success: false, error }` response. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const forbidden = () => new HttpError(403, "Forbidden: Insufficient permissions");
export const notFound = (what: string) => new HttpError(404, `${what} not found`);

export function ok(reply: FastifyReply, data: unknown, status = 200) {
  return reply.code(status).send({ success: true, data });
}

export function deleted(reply: FastifyReply, message: string, data?: unknown) {
  return reply.send(data === undefined ? { success: true, message } : { success: true, message, data });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value);

/** Route id that must be a UUID; anything else can't exist, so it's a 404. */
export function idParam(params: unknown, what: string): string {
  const id = (params as { id?: string }).id;
  if (!isUuid(id)) throw notFound(what);
  return id;
}
