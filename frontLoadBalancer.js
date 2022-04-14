import { createServer } from 'http';
import httpProxy from 'http-proxy';
import consul from 'consul';

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
      if (err) reject();
      const servers = !err && Object.values(services)
        .filter(serv => serv.Tags.includes(route.service));
      cache.set(route.path, servers);
      removeCacheTimer(route.path);
      resolve(servers);
    })
  })
};

const server = createServer(async (req, res) => {
  // favicon 은 file route 로 뺄 수 있으면 그쪽으로 빼는게 좋을듯?
  if (req.url === "/favicon.ico") return;
  console.log('req.url', req.url);

  const route = routing.find((route) => {
    return req.url.startsWith(route.path);
  });

  const servers = await fetchServices(route);


  route.index = (route.index + 1) % servers.length;
  const server = servers[route.index];
  console.log('server ', server);
  const target = `http://${server.Address}:${server.Port}`;
  proxy.web(req, res, { target });
});

server.listen(8080, () => {
  console.log('Load Balancer server started on 8080');
});