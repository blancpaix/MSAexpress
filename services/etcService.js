import express from 'express';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';

import ConsulManager from '../utils/consulManager.js';

async function main() {
  const { pid } = process;
  const serviceType = process.argv[2];
  const ADDRESS = process.env.ADDRESS || 'localhost';
  const PORT = await portFinder.getPortPromise();
  const serviceId = nanoid();

  const paymentConsul = new ConsulManager(serviceType, serviceId, ADDRESS, PORT);

  process.on('exit', (data) => paymentConsul.unregisterService(data));
  process.on('SIGINT', (data) => paymentConsul.unregisterService(data));
  process.on('uncaughtException', (data) => paymentConsul.unregisterService(data));

  const app = express();
  app.use(morgan('dev'));

  app.use('/etc', (req, res) => {
    res.send('you called etc request');
  });

  app.use((req, res, next) => {
    const err = new Error('404, NOT FOUND');
    err.status = 404;
    next(err);
  });

  app.listen(PORT, () => {
    paymentConsul.registerService();
    console.log(`Started ${serviceType} at ${pid} on port : ${PORT}`);
  });
};

main().catch(err => {
  console.error('err in payment-service', err);
});

// cmd : nodemon --signal SIGINT etcService.js etc-service
// loadBalancer : path : /etc,   service: etc-service