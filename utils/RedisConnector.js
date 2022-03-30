import Redis from 'ioredis';
import { redisConfig } from './ConfigManager.js';

export const RedisConn = new Redis(redisConfig);
RedisConn.on('connect', () => { console.log('[REDIS] connect to local-server') });
RedisConn.on('error', (err) => { console.error('|REDIS| cannot connect to Redis Server', err) });



/*
clust options
const cluster = new Redis.Cluster([
  {
    port: 6380,
    host: "127.0.0.1",
  },
  {
    port: 6381,
    host: "127.0.0.1",
  },
]);

cluster.set("foo", "bar");
cluster.get("foo", (err, res) => {
  // res === 'bar'
});

== password options with cluster
const cluster = new Redis.Cluster(nodes, {
  redisOptions: {
    password: "your-cluster-password",
  },
});


== normal options
opts:
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
  username: "default", // needs Redis >= 6
  password: "my-top-secret",
  db: 0, // Defaults to 0
  tls: {
    // Refer to `tls.connect()` section in
    // https://nodejs.org/api/tls.html
    // for all supported options
    ca: fs.readFileSync("cert.pem"),
  },
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1,
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true; // or `return 1;`
    }
  },


  conenction events : [connect, ready, error, close, reconnection, end, wait]

== error Handling
redis.set('foo', (err) => {
  err instanceof Redis.ReplyError;
})
*/
