import express from 'express';
import path from 'path';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';
import connRedis from 'connect-redis';
import session from 'express-session';
import passport from 'passport';
import consul from 'consul';

import ConsulManager from '../utils/ConsulManager.js';
import { RedisConn } from '../utils/RedisConnector.js';
import { sessionConfig } from '../utils/ConfigManager.js'
import passportConfig from '../utils/passportConfig.js';

import fileRouter from '../routers/fileRouter.js';

const node_env = process.env.NODE_ENV === "production" ? "production" : "dev";
const __dirname = path.resolve();
console.log('[CHECK ENV] : ', node_env, __dirname);

const consulClient = consul();
const serviceId = nanoid();

// 클래스로 빼버리니까 실행이 잘 안됩니다ㅠ
function unregisterService(err) {
  err && console.error('|Consul| Unregister service!', err);
  consulClient.agent.service.deregister(serviceId, () => {
    process.exit(err ? 1 : 0);
  });
};

process.on('exit', data => unregisterService(data));
process.on('SIGINT', unregisterService);
process.on('uncaughtException', data => unregisterService(data));

async function main() {
  const serviceType = process.argv[2];
  const { pid } = process;
  const PORT = await portFinder.getPortPromise();
  const ADDRESS = process.env.ADDRESS || 'localhost';
  const authConsul = new ConsulManager(serviceType, serviceId, ADDRESS, PORT);
  const RedisStore = connRedis(session);
  const app = express();

  app.use(express.json());    // 기존 body-parser 내장화
  app.use(express.urlencoded({ extended: true }));

  passportConfig(passport);

  app.use(morgan('dev'));
  app.use(session({
    ...sessionConfig,
    store: new RedisStore({ client: RedisConn }),
  }));
  app.use(passport.initialize());   // req에 passport 적용
  app.use(passport.session());      // req.session에 passport info 설정

  app.use('/file/static', express.static(path.join(__dirname, '/statics')));
  app.use('/file/img', express.static(path.join(__dirname, '/images')));
  app.use('/file/upload', fileRouter);

  app.use((err, req, res, next) => {
    if (!err) return res.sendStatus(404).send('Not Found.');
    console.log('err last handler', err);
    res.status(err.code || 500).json({ Error: err.message });
    next();
  });

  app.listen(PORT, () => {
    authConsul.registerService();
    console.log(`[SERVER] Started ${serviceType} at ${pid} on port : ${PORT}`);
  });
};

main().catch(err => {
  console.error('|SERVER| err in auth-service', err);
  process.exit(1);
});

// loadBalancer : path : /auth,   service: auth-service