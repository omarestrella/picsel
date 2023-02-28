import { unpack, pack } from "msgpackr";

export type Messages = {
  // Server
  sync(data: Uint8Array): void;
  connected(data: Uint8Array): void;

  // Client
  update(updates: number[]): void;
  connect(documentID: string, actorID: string): void;
};

export function encodeMessage<K extends keyof Messages>(
  type: K,
  ...args: Parameters<Messages[K]>
) {
  return pack({
    type,
    data: args,
  });
}

export function decodeMessage(message: Buffer | Uint8Array) {
  return unpack(message);
}
