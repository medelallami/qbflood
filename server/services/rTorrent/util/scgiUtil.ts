import fs from 'node:fs';
import net from 'node:net';

import {RPCError} from '../types/RPCError';
import type {MultiMethodCalls} from './rTorrentMethodCallUtil';
import deserializer from './XMLRPCDeserializer';
import type {XMLRPCValue} from './XMLRPCSerializer';
import serializer from './XMLRPCSerializer';

const NULL_CHAR = String.fromCharCode(0);

const formatConnectionError = (options: net.NetConnectOpts, cause: NodeJS.ErrnoException): Error => {
  const target =
    typeof options.path === 'string'
      ? options.path
      : `${options.host ?? 'localhost'}:${options.port ?? ''}`;

  if (cause.code === 'ENOENT' && typeof options.path === 'string') {
    return new Error(
      `rTorrent SCGI socket not found at "${target}". Mount the volume into the Flood container that contains it (e.g. -v <rtdir>:<rtdir>) and verify the value set in --rtconfig.`,
    );
  }

  if (cause.code === 'ECONNREFUSED' && typeof options.path === 'string') {
    let isFilePresent = false;
    try {
      isFilePresent = fs.statSync(options.path).isSocket();
    } catch {
      isFilePresent = false;
    }

    if (!isFilePresent) {
      return new Error(
        `rTorrent SCGI socket path "${target}" exists but is not accessible. Check that rTorrent is running, that the socket file permissions allow the Flood user, and that the volume is mounted into the Flood container.`,
      );
    }
  }

  return new Error(`Failed to connect to rTorrent at ${target}: ${cause.code ?? ''} ${cause.message}`.trim());
};

const bufferStream = (stream: net.Socket): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });

export const methodCallXML = (options: net.NetConnectOpts, methodName: string, params: XMLRPCValue[]) =>
  // TODO: better typings

  new Promise<any>((resolve, reject) => {
    const stream = net.connect(options);
    const xml = serializer.serializeSync(methodName, params);
    const xmlLength = Buffer.byteLength(xml, 'utf8');

    stream.on('error', (err) => reject(formatConnectionError(options, err as NodeJS.ErrnoException)));
    stream.setEncoding('utf8');

    const headerItems = [
      `CONTENT_LENGTH${NULL_CHAR}${xmlLength}${NULL_CHAR}`,
      `CONTENT_TYPE${NULL_CHAR}text/xml${NULL_CHAR}`,
      `SCGI${NULL_CHAR}1${NULL_CHAR}`,
    ];

    const headerLength = headerItems.reduce((accumulator, headerItem) => accumulator + headerItem.length, 0);

    stream.end(`${headerLength}:${headerItems.join('')},${xml}`);

    bufferStream(stream)
      .then((data) => deserializer.deserialize(data))
      .then(resolve, reject);
  });

export const methodCallJSON = (options: net.NetConnectOpts, methodName: string, params: unknown[]) =>
  // TODO: better typings

  new Promise<any>((resolve, reject) => {
    const stream = net.connect(options);
    const request =
      methodName == 'system.multicall'
        ? (params[0] as MultiMethodCalls).map((call) => ({
            jsonrpc: '2.0',
            id: null,
            method: call.methodName,
            params: call.params,
          }))
        : {
            jsonrpc: '2.0',
            id: null,
            method: methodName,
            params,
          };

    const json = JSON.stringify(request);
    const jsonLength = Buffer.byteLength(json, 'utf8');

    stream.on('error', (err) => reject(formatConnectionError(options, err as NodeJS.ErrnoException)));
    stream.setEncoding('utf8');

    const headerItems = [
      `CONTENT_LENGTH${NULL_CHAR}${jsonLength}${NULL_CHAR}`,
      `CONTENT_TYPE${NULL_CHAR}application/json${NULL_CHAR}`,
      `SCGI${NULL_CHAR}1${NULL_CHAR}`,
    ];

    const headerLength = headerItems.reduce((accumulator, headerItem) => accumulator + headerItem.length, 0);

    stream.end(`${headerLength}:${headerItems.join('')},${json}`);

    bufferStream(stream)
      .then((data: string) => {
        const jsonResponse = JSON.parse(data.slice(data.lastIndexOf('\n')));
        if (Array.isArray(jsonResponse)) {
          return jsonResponse.map((response) => {
            if (response.result == null) {
              const {code, message} = response.error || {};
              throw RPCError(message, code);
            }
            return response.result;
          });
        } else {
          if (jsonResponse.result == null) {
            const {code, message} = jsonResponse.error || {};
            throw RPCError(message, code);
          }
          return jsonResponse.result;
        }
      })
      .then(resolve, reject);
  });
