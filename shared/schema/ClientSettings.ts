import type {infer as zodInfer} from 'zod';
import {array, boolean, strictObject, string, z} from 'zod';

const coerceNumber = z.coerce.number();

export const clientSettingsSchema = strictObject({
  dht: boolean(),
  dhtPort: coerceNumber,
  directoryDefault: string(),
  // Optional supplementary paths reported by some torrent clients
  // (qBittorrent exposes 'temp_path' for incomplete downloads and
  // 'save_path' for the completed download directory). When omitted
  // the client does not provide them; UI features should hide them
  // in that case rather than guess.
  incompleteDirectory: string().optional(),
  networkHttpMaxOpen: coerceNumber,
  networkLocalAddress: array(string()),
  networkMaxOpenFiles: coerceNumber,
  networkPortOpen: boolean(),
  networkPortRandom: boolean(),
  networkPortRange: string(),
  piecesHashOnCompletion: boolean(),
  piecesMemoryMax: coerceNumber,
  protocolPex: boolean(),
  throttleGlobalDownSpeed: coerceNumber,
  throttleGlobalUpSpeed: coerceNumber,
  throttleMaxPeersNormal: coerceNumber,
  throttleMaxPeersSeed: coerceNumber,
  throttleMaxDownloads: coerceNumber,
  throttleMaxDownloadsGlobal: coerceNumber,
  throttleMaxUploads: coerceNumber,
  throttleMaxUploadsGlobal: coerceNumber,
  throttleMinPeersNormal: coerceNumber,
  throttleMinPeersSeed: coerceNumber,
  trackersNumWant: coerceNumber,
}).strip();

// PATCH /api/client/settings
export const setClientSettingsSchema = clientSettingsSchema.partial().strip();

export type ClientSettingsSchema = zodInfer<typeof clientSettingsSchema>;
export type SetClientSettingsSchema = zodInfer<typeof setClientSettingsSchema>;
