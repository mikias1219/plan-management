export function serialize<T extends { _id?: unknown }>(
  doc: { toObject: (opts?: object) => T } | T,
): T & { id: string } {
  const obj = typeof (doc as { toObject?: Function }).toObject === 'function'
    ? (doc as { toObject: (opts?: object) => T }).toObject({ virtuals: false })
    : { ...(doc as T) };
  const id = String((obj as { _id?: unknown })._id ?? '');
  const rest = { ...obj } as T & { id: string; _id?: unknown; __v?: unknown };
  delete rest._id;
  delete rest.__v;
  rest.id = id;
  return rest;
}

export function serializeMany<T extends { _id?: unknown }>(docs: Array<{ toObject: () => T } | T>) {
  return docs.map((doc) => serialize(doc));
}
