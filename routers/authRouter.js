import express from 'express';
import { redisBuilder } from '../utils/RedisConnector.js';

const router = express.Router();
const redis = redisBuilder();

function logger(req, res, next) {
  console.log('Time : ', Date.now());
  next();
};

router.use(logger);

// restAPI 를 만드려면은.. signin 에서 PATCH, DELETE, POST?? 뭐 이런식으로 되는건데

router.post('/sign')

router.get('/', (req, res) => {
  redis.set("foo", "bar");
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


/*
  promise 로 함수 시작햇으면
  .then() 에서 값이 도출되지 않는경우
  .catch(next) 로 next를 명시적으로 호출하고 프라미스를 종료시켜야 함
*/