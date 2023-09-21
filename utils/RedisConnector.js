import Redis from 'ioredis';
import { redisConfig } from './ConfigManager.js';

// Singleton 유지
export const RedisConn = new Redis(redisConfig);
RedisConn.on('connect', () => {
  console.log('[REDIS] connect to local-server')
});
RedisConn.on('error', (err) => {
  console.error('|REDIS| cannot connect to Redis Server', err)
});


