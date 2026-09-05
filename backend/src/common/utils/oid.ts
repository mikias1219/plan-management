import { Types } from 'mongoose';

export function oid(id: string | Types.ObjectId): Types.ObjectId {
  return id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
}

/** Matches userId stored as ObjectId or string (legacy writes). */
export function ownedBy(userId: string) {
  return { $in: [oid(userId), userId] };
}
