import express from 'express';
import path from 'path';
import portFinder from 'portfinder';
import { nanoid } from 'nanoid';
import morgan from 'morgan';
import connRedis from 'connect-redis';
import session from 'express-session';
import passport from 'passport';
import consul from 'consul';

import winstonLogger from '../utils/winstonLogger.js';
import ConsulManager from '../utils/ConsulManager.js';
import { db } from '../models/FileIndex.js'
import { RedisConn } from '../utils/RedisConnector.js';
import { sessionConfig } from '../utils/ConfigManager.js'
import passportConfig from '../utils/passportConfig.js';
import '../amqp/fileHandler.js';

import fileRouter from '../routers/fileRouter.js';

const consulClient = consul();
const serviceId = nanoid();
const __dirname = path.resolve();

// 클래스에 넣어버리니까 실행이 잘 안됩니다ㅠ
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
  const fileConsul = new ConsulManager(serviceType, serviceId, ADDRESS, PORT);
  const RedisStore = connRedis(session);
  const app = express();

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
  }));
  app.use(passport.initialize());   // req에 passport 적용
  app.use(passport.session());      // req.session에 passport info 설정

  app.use('/file/static', express.static(path.join(__dirname, '/statics')));
  app.use('/file/img', express.static(path.join(__dirname, '/images')));
  app.use('/file/manage', fileRouter);


  app.use((err, req, res, next) => {
    if (!err) return res.sendStatus(404).send('Not Found.');
    console.log('err last handler', err);
    res.status(err.code || 500).json({ Error: err.message });
    next();
  });

  app.listen(PORT, () => {
    fileConsul.registerService();
    console.log(`[SERVER] Started ${serviceType} at ${pid} on port : ${PORT}`);
  });
};

main().catch(err => {
  console.error('|SERVER| err in file-service', err);
  process.exit(1);
});

// path : /file,   service: file-service