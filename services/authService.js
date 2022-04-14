import express from 'express';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';
import connRedis from 'connect-redis';
import session from 'express-session';
import passport from 'passport';
import consul from 'consul';

import ConsulManager from '../utils/ConsulManager.js';
import { db } from '../models/AuthIndex.js';
import { RedisConn } from '../utils/RedisConnector.js';
import { sessionConfig } from '../utils/ConfigManager.js'

import authRouter from '../routers/authRouter.js';
import passportConfig from '../utils/passportConfig.js';
import '../amqp/authHandler.js';

const node_env = process.env.NODE_ENV === "production" ? "production" : "dev";
console.log('[CHECK ENV] : ', node_env);

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
  const { pid } = process;
  const serviceType = process.argv[2];
  const PORT = await portFinder.getPortPromise();

  const ADDRESS = process.env.ADDRESS || 'localhost';
  const authConsul = new ConsulManager(serviceType, serviceId, ADDRESS, PORT);
  const RedisStore = connRedis(session);
  const app = express();

  app.use(express.json());    // 기존 body-parser 내장화
  app.use(express.urlencoded({ extended: true }));

  db.sequelize.sync();
  passportConfig(passport);

  app.use(morgan('dev'));
  app.use(session({
    ...sessionConfig,
    store: new RedisStore({ client: RedisConn }),
  }));
  app.use(passport.initialize());   // req에 passport 적용
  app.use(passport.session());      // req.session에 passport info 설정

  app.use('/auth', authRouter);

  app.use((err, req, res, next) => {
    console.log('err last handler', err);
    res.status(err.code || 500).json({ Error: err.message });
  });

  app.use((req, res, next) => {
    res.status(404).json({ Error: 'Not Found' });
  });

  app.listen(PORT, () => {
    authConsul.registerService();
    console.log(`[SERVER] Started ${serviceType} at ${pid} on port : ${PORT}`);
  })
};

main().catch(err => {
  console.error('|SERVER| err in auth-service', err);
});

// loadBalancer : path : /auth,   service: auth-service