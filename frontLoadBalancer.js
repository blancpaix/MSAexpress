import { createServer } from 'http';
import { createServer as sslCreateServer } from 'https';
import httpProxy from 'http-proxy';
import consul from 'consul';
import { sslOptions } from './utils/ConfigManager.js';

const routing = [
  {
    path: '/auth',
    service: 'auth-service',
    index: 0,
  },
  {
    path: '/pay',
    service: 'pay-service',
    index: 0,
  },
  {
    path: '/file',
    service: 'file-service',
    index: 0,
  },
];

const cache = new Map();

const consulClient = consul();
const proxy = httpProxy.createProxyServer();

proxy.on('error', (err, req, res) => {
  res.writeHead(500).end('Something was wrong...');
});

// 저장된 캐시 10초마다 제거
async function removeCacheTimer(path) {
  setTimeout(() => {
    cache.delete(path);
  }, 10000);
};

const fetchServices = async (route) => {
  const list = cache.get(route.path);
  if (list) {
    return list;
  } else {
    return await consulList(route);
  }
};

const consulList = (route) => {
  return new Promise((resolve, reject) => {
    consulClient.agent.service.list((err, services) => {
      if (err) reject(new Error('Bad gateway.'));
      const servers = !err && Object.values(services)
        .filter(serv => serv.Tags.includes(route.service));
      cache.set(route.path, servers);
      removeCacheTimer(route.path);
      resolve(servers);
    })
  })
};

const headers = {
  "Access-Control-Allow-Origin": "*", // input your domain [http://DOMAIN, https://DOMAIN]
  "Access-Control-Allow-Methods": "PATCH, POST, GET, DELETE",
  "Access-Control-Max-Age": 1296000, // 15 days
}

const loadbalancing = async (req, res) => {
  // favicon 은 클라이언트에서 요청 주소를 변경해야함  DOMAIN.com/file/static/favicon.ico
  if (req.url === '/favicon.ico') return;

  const route = routing.find((route) => {
    return req.url.startsWith(route.path);
  });

  const servers = await fetchServices(route);
  if (typeof servers === Error || !servers.length) return res.status(502).end('Bad gateway.');

  route.index = (route.index + 1) % servers.length;
  const server = servers[route.index];
  console.log('server ', server);
  const target = `http://${server.Address}:${server.Port}`;
  proxy.web(req, res, { target });
};


const server = createServer(async (req, res) => {
  res.writeHead(200, headers);
  loadbalancing(req, res);
});
const sslServer = sslCreateServer(sslOptions, async (req, res) => {
  loadbalancing(req, res);
});

server.listen(8080, () => {
  console.log('Load Balancer server started on 8080');
});
sslServer.listen(443, () => {
  console.log('Load Balancer server with SSL started on 443');
});