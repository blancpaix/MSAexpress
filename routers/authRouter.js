import express from 'express';
import { redisBuilder } from '../utils/RedisConnector.js';

const router = express.Router();
const redis = redisBuilder();
redis.on('connect', () => { console.log('[Redis] connect to local-server') });

function logger(req, res, next) {
  console.log('Time : ', Date.now());
  next();
};


router.use(logger);


// Sample test
router.get('/', async (req, res) => {
  redis.set("foo", "bar");
  console.log('check dbPool', global.dbPool);
  res.end('you want to join us?');
});

router.get('/:id', async (req, res) => {
  console.log('req.params', req.params, req.body);
  // dynamic params => req.params 으로 입력
  res.send(await redis.get("foo"));
});

router.get('/data/:dataId', (req, res) => {
  console.log('req.params', req.params);
  res.send('this');
});

router.route('/better/:id')
  .get((req, res) => {
    console.log('much better GET!');
    res.end('much better GET!');
  })
  .post((req, res) => {
    console.log('PUT!', req.params);
    res.send(req.params);
  });


export default router;

