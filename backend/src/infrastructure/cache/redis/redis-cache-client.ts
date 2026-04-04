import Redis from 'ioredis';

import { appConfig } from '../../../config/app.config';

const CACHE_KEY_PREFIX = 'mindonroad:v1';
const DEFAULT_TTL_SECONDS = 30;

let redisClient: Redis | null = null;
let redisEventHandlersAttached = false;

export async function readCacheJson<TValue>(cacheKey: string) {
  try {
    const client = getRedisClient();
    await ensureRedisConnected(client);

    const rawValue = await client.get(toNamespacedKey(cacheKey));

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as TValue;
  } catch (error) {
    console.warn('[redis-cache] read skipped', {
      cacheKey,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

export async function writeCacheJson(
  cacheKey: string,
  value: unknown,
  ttlSeconds = DEFAULT_TTL_SECONDS
) {
  try {
    const client = getRedisClient();
    await ensureRedisConnected(client);

    await client.set(
      toNamespacedKey(cacheKey),
      JSON.stringify(value),
      'EX',
      ttlSeconds
    );
  } catch (error) {
    console.warn('[redis-cache] write skipped', {
      cacheKey,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function deleteCacheByPrefix(cacheKeyPrefix: string) {
  try {
    const client = getRedisClient();
    await ensureRedisConnected(client);

    const namespacedPrefix = toNamespacedKey(cacheKeyPrefix);
    const keys = await client.keys(`${namespacedPrefix}*`);

    if (keys.length === 0) {
      return;
    }

    await client.del(...keys);
  } catch (error) {
    console.warn('[redis-cache] delete skipped', {
      cacheKeyPrefix,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(appConfig.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 500
    });
  }

  if (!redisEventHandlersAttached) {
    redisClient.on('error', (error) => {
      console.warn('[redis-cache] connection error', error.message);
    });
    redisEventHandlersAttached = true;
  }

  return redisClient;
}

async function ensureRedisConnected(client: Redis) {
  if (client.status === 'ready') {
    return;
  }

  if (client.status === 'wait') {
    await client.connect();
  }
}

function toNamespacedKey(cacheKey: string) {
  return `${CACHE_KEY_PREFIX}:${cacheKey}`;
}
