import { createServer } from 'http';
import consul from 'consul';
import portfinder from 'portfinder';
import { nanoid } from 'nanoid';

const serviceType = process.argv[2];
console.log('serviceType: ', serviceType);
const { pid } = process;

async function main() {
  const consulClient = consul();

  const port = await portfinder.getPortPromise();
  const address = process.env.ADDRESS || 'localhost';
  const serviceId = nanoid();

  function registerService() {
    consulClient.agent.service.register({
      id: serviceId,
      name: serviceType,
      address,
      port,
      tags: [serviceType],
    }, () => {
      console.log(`${serviceType} registered successfully`);
    })
  };

  function unregisterService(err) {
    err && console.error(err);
    console.log(`deregistering ${serviceId}`);
    consulClient.agent.service.deregister(serviceId, (err2) => {
      if (err2) console.error(err2);
      process.exit(err ? 1 : 0);
    })
  }

  process.on('exit', unregisterService);
  process.on('uncaughtException', unregisterService);
  process.on('SIGINT', unregisterService);

  const server = createServer((req, res) => {
    console.log(`Handling request from ${pid}`);
    res.end(`${serviceType} response from ${pid}`);
  });

  server.listen(port, address, () => {
    registerService();
    console.log(`Started ${serviceType} at ${pid} on port : ${port}`);
  })
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});

// nodemon --signal SIGINT consulServer.js api-service