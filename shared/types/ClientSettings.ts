export interface ClientSettings {
  dht: boolean;
  dhtPort: number;
  directoryDefault: string;
  // qBittorrent exposes the directory used to stage incomplete
  // downloads via the 'temp_path' app preference. Other clients do
  // not surface a comparable value, so this is optional.
  incompleteDirectory?: string;
  networkHttpMaxOpen: number;
  networkLocalAddress: Array<string>;
  networkMaxOpenFiles: number;
  networkPortOpen: boolean;
  networkPortRandom: boolean;
  networkPortRange: string;
  piecesHashOnCompletion: boolean;
  piecesMemoryMax: number;
  protocolPex: boolean;
  // B/s
  throttleGlobalDownSpeed: number;
  // B/s
  throttleGlobalUpSpeed: number;
  throttleMaxPeersNormal: number;
  throttleMaxPeersSeed: number;
  throttleMaxDownloads: number;
  throttleMaxDownloadsGlobal: number;
  throttleMaxUploads: number;
  throttleMaxUploadsGlobal: number;
  throttleMinPeersNormal: number;
  throttleMinPeersSeed: number;
  trackersNumWant: number;
}

export type ClientSetting = keyof ClientSettings;
