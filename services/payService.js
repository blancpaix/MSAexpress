import express from 'express';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';
import connRedis from 'connect-redis';
import session from 'express-session';
import passport from 'passport';
import consul from 'consul';

import winstonLogger from '../utils/winstonLogger.js';
import ConsulManager from '../utils/ConsulManager.js';
import { db } from '../models/PayIndex.js';
import { RedisConn } from '../utils/RedisConnector.js';
import { sessionConfig } from '../utils/ConfigManager.js';
import passportConfig from '../utils/passportConfig.js';
import { amqpRequest } from '../utils/mq/RequestFactory.js';

import payRouter from '../routers/payRouter.js';

const consulClient = consul();
const serviceId = nanoid();
// 클래스로 빼버리니까... 실행이 안됩니다...
function unregisterService(err) {
  err && console.error('|Consul| Unregister service!', err);
  consulClient.agent.service.deregister(serviceId, () => {
    console.log('process termiatnated. ', err);
    process.exit(err ? 1 : 0);
  });
};

process.on('exit', data => unregisterService(data));
process.on('SIGINT', data => unregisterService(data));
process.on('uncaughtException', data => unregisterService(data));


async function main() {
  const serviceType = process.argv[2];
  const { pid } = process;
  const PORT = await portFinder.getPortPromise();

  const ADDRESS = process.env.ADDRESS || 'localhost';
  const payConsul = new ConsulManager(serviceType, serviceId, ADDRESS, PORT);
  const RedisStore = connRedis(session);
  const app = express();
  await amqpRequest.initialize();

  app.use(express.json());    // 기존 body-parser 내장화
  app.use(express.urlencoded({ extended: true }));

  db.sequelize.sync();
  passportConfig(passport);

  app.use(morgan(
    process.env.NODE_ENV === "production" ? "production" : "dev", {
    stream: winstonLogger.stream
  }));
  app.use(session({
    ...sessionConfig,
    store: new RedisStore({ client: RedisConn }),
  }))
  app.use(passport.initialize());   // req 객체에 passport 설정
  app.use(passport.session());      // req.session 객체에 passport info 설정    // 여기 오지도 않ㅇ므 se, de seraizliae 인데

  app.use('/pay', payRouter);


  app.use((err, req, res, next) => {
    if (!err) return res.sendStatus(404).send('Not Found.');
    console.log('err last handler', err);
    let message;
    if (err.message) message = err.message;
    if (err.errors && err.errors[0].message) message = err.errors[0].message;
    res.status(err.code || 500).json({ Error: message });
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

// path : /pay,   service: pay-service