import express from 'express';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';
import connRedis from 'connect-redis';
import session from 'express-session';
import passport from 'passport';

import ConsulManager from '../utils/ConsulManager.js';
import { db } from '../models/PayIndex.js';
import { sessionConfig } from '../utils/ConfigManager.js';

import payRouter from '../routers/payRouter.js';
import passportConfig from '../utils/passportConfig.js';
import { RedisConn } from '../utils/RedisConnector.js';

import { amqpRequest } from '../utils/mq/RequestFactory.js';

async function main() {
  const serviceType = process.argv[2];
  const { pid } = process;
  const PORT = await portFinder.getPortPromise();
  const serviceId = nanoid();
  const ADDRESS = process.env.ADDRESS || 'localhost';
  const payConsul = new ConsulManager(serviceType, serviceId, ADDRESS, PORT);
  const RedisStore = connRedis(session);
  const app = express();
  await amqpRequest.initialize();

  process.on('exit', data => payConsul.unregisterService(data));
  process.on('SIGINT', data => payConsul.unregisterService(data));
  process.on('uncaughtException', data => payConsul.unregisterService(data));

  app.use(express.json());    // 기존 body-parser 내장화
  app.use(express.urlencoded({ extended: true }));

  db.sequelize.sync();
  passportConfig(passport);

  app.use(morgan('dev'));
  app.use(session({
    ...sessionConfig,
    store: new RedisStore({ client: RedisConn }),
  }))
  app.use(passport.initialize());   // req 객체에 passport 설정
  app.use(passport.session());      // req.session 객체에 passport info 설정    // 여기 오지도 않ㅇ므 se, de seraizliae 인데

  app.use('/pay', payRouter);


  app.use((err, req, res, next) => {
    console.log('err last handler', err);
    res.status(err.code || 500).json({ Error: err.message });
  });

  app.use((req, res, next) => {
    res.status(404).json({ Error: 'Not Found' });
  });


  app.listen(PORT, () => {
    payConsul.registerService();
    console.log(`[SERVER] Started ${serviceType} at ${pid} on port : ${PORT}`);
  })
};

main().catch(err => {
  console.error('|SERVER| err in pay-service', err);
  process.exit(1);
});

// cmd : nodemon --signal SIGINT payService.js pay-service
// loadBalancer : path : /pay,   service: pay-service