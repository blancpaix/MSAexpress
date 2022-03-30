import express from 'express';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';
import connRedis from 'connect-redis';
import session from 'express-session';
import passport from 'passport';

import ConsulManager from '../utils/ConsulManager.js';
import { db } from '../models/authIndex.js';
import { RedisConn } from '../utils/RedisConnector.js';
import { sessionConfig } from '../utils/ConfigManager.js'

import authRouter from '../routers/authRouter.js';
import passportConfig from '../utils/passportConfig.js';

async function main() {
  const serviceType = process.argv[2];
  const { pid } = process;
  const PORT = await portFinder.getPortPromise();
  const serviceId = nanoid();
  const ADDRESS = process.env.ADDRESS || 'localhost';
  const app = express();
  const authConsul = new ConsulManager(serviceType, serviceId, ADDRESS, PORT);
  const RedisStore = connRedis(session);

  process.on('exit', data => authConsul.unregisterService(data));
  process.on('SIGINT', data => authConsul.unregisterService(data));
  process.on('uncaughtException', data => authConsul.unregisterService(data));

  app.use(express.json());    // 기존 body-parser 내장화
  app.use(express.urlencoded({ extended: true }));

  db.sequelize.sync();


  passportConfig(passport);

  app.use(morgan('dev'));
  app.use(session({
    ...sessionConfig,
    store: new RedisStore({ client: RedisConn }),
  }));
  app.use(passport.initialize());   // req 객체에 passport 설정
  app.use(passport.session());      // req.session 객체에 passport info 설정    // 여기 오지도 않ㅇ므 se, de seraizliae 인데

  app.use('/auth', authRouter);
  app.use((req, res, next) => {
    const err = new Error('404, NOT FOUND');
    err.status = 404;
    next(err);
  });


  app.listen(PORT, () => {
    authConsul.registerService();
    console.log(`[SERVER] Started ${serviceType} at ${pid} on port : ${PORT}`);
  })
};

main().catch(err => {
  console.error('|SERVER| err in auth-service', err);
  process.exit(1);
});

// cmd : nodemon --signal SIGINT authService.js auth-service
// loadBalancer : path : /auth,   service: auth-service