import express from 'express';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';

import ConsulManager from '../utils/consulManager.js';
import authRouter from '../routers/authRouter.js';

async function main() {
  const serviceType = process.argv[2];
  const { pid } = process;
  const PORT = await portFinder.getPortPromise();
  const serviceId = nanoid();
  const ADDRESS = process.env.ADDRESS || 'localhost';

  const authConsul = new ConsulManager(serviceType, serviceId, ADDRESS, PORT);

  process.on('exit', data => authConsul.unregisterService(data));
  process.on('SIGINT', data => authConsul.unregisterService(data));
  process.on('uncaughtException', data => authConsul.unregisterService(data));

  const app = express();

  app.use(morgan('dev'));

  app.use('/auth', authRouter);
  app.use((req, res, next) => {
    const err = new Error('404, NOT FOUND');
    err.status = 404;
    next(err);
  });

  app.listen(PORT, () => {
    authConsul.registerService();
    console.log(`Started ${serviceType} at ${pid} on port : ${PORT}`);
  })
};

main().catch(err => {
  console.error('err in auth-service', err);
  process.exit(1);
});

// cmd : nodemon --signal SIGINT authService.js auth-service
// loadBalancer : path : /auth,   service: auth-service