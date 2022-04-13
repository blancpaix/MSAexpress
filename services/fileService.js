import express from 'express';
import path from 'path';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';
import connRedis from 'connect-redis';
import session from 'express-session';
import passport from 'passport';

import ConsulManager from '../utils/ConsulManager.js';
import { RedisConn } from '../utils/RedisConnector.js';
import { sessionConfig } from '../utils/ConfigManager.js'
import passportConfig from '../utils/passportConfig.js';

import fileRouter from '../routers/fileRouter.js';

const node_env = process.env.NODE_ENV === "production" ? "production" : "dev";
const __dirname = path.resolve();
console.log('[CHECK ENV] : ', node_env, __dirname);

async function main() {
  const serviceType = process.argv[2];
  const { pid } = process;
  const PORT = await portFinder.getPortPromise();
  const serviceId = nanoid();
  const ADDRESS = process.env.ADDRESS || 'localhost';
  const authConsul = new ConsulManager(serviceType, serviceId, ADDRESS, PORT);
  const RedisStore = connRedis(session);
  const app = express();

  process.on('exit', data => authConsul.unregisterService(data));
  process.on('SIGINT', data => authConsul.unregisterService(data));
  process.on('uncaughtException', data => authConsul.unregisterService(data));

  // app.use(express.json());    // 기존 body-parser 내장화
  // app.use(express.urlencoded({ extended: true }));

  passportConfig(passport);

  app.use(morgan('dev'));
  app.use(session({
    ...sessionConfig,
    store: new RedisStore({ client: RedisConn }),
  }));
  app.use(passport.initialize());   // req에 passport 적용
  app.use(passport.session());      // req.session에 passport info 설정

  app.use('/static', express.static(path.join(__dirname, '../statics')));
  app.use('/img', express.static(path.join(__dirname, '../images')));
  app.use('/file', fileRouter);

  app.use((err, req, res, next) => {
    console.log('err last handler', err);
    res.status(err.code || 500).json({ Error: err.message });
  });

  // Error 도 없고, 페이지도 없고,
  app.use((req, res, next) => {
    res.sendStatus(404).send('Not Found.');
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