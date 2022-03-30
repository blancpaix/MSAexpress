import express from 'express';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';

import ConsulManager from '../utils/consulManager.js';
import payIndexRouter from '../routers/pay_indexRouter.js';

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

  app.use('/pay', payIndexRouter);
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

// cmd : nodemon --signal SIGINT payService.js pay-service
// loadBalancer : path : /pay,   service: pay-service