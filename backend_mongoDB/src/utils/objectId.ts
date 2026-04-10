import mongoose from "mongoose";

/** Express 5 tipa `req.params.*` como `string | string[]`. */
export function paramId(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export function isValidObjectId(id: string | undefined | null): id is string {
  return Boolean(id && mongoose.Types.ObjectId.isValid(id));
}
