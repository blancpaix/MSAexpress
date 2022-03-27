// Example : counter with timer 
import express from 'express';
const router = express.Router();

const countObject = {};
const CACHE_TTL = 1000 * 5;

router.get('/', (req, res) => {
  console.log(countObject);
  res.end('Hi, there?')
});

router.get('/create/:id', async (req, res) => {
  countObject[req.params.id] = { count: 0, date: new Date(), queuing: false, };
  await deleteCountObj(req.params.id);
  res.end('/created');
});

router.get('/up/:id', async (req, res) => {
  const target = countObject[req.params.id];
  if (target && target.queuing) {
    target.count++;
  } else if (target && !target.queuing) {
    target.count++;
    target.queuing = true;
    await sendCountTimer(req.params.id, res);
  }
  res.end('up');
});
router.get('/down/:id', async (req, res) => {
  const target = countObject[req.params.id];
  if (target && target.queuing) {
    target.count--;
  } else if (target && !target.queuing) {
    target.count--;
    target.queuing = true;
    await sendCountTimer(req.params.id, res);
  }
  res.end('down');
});

async function deleteCountObj(id) {
  setTimeout(() => {
    console.log('delete will be called by ', id);
    countObject[id] = null;
    delete countObject[id];
    console.log(countObject);
  }, CACHE_TTL)
};

async function sendCountTimer(id, res) {
  setTimeout(() => {
    const target = countObject[id];
    if (target) {
      console.log('send Message per 500ms', id + " ", target.count);
      target.queuing = false;
      res.end(target.count);
    }
  }, 1000)
}


export default router;


/*
GET /create/1 200 2.010 ms - -
GET /create/2 200 0.311 ms - -
GET /up/2 200 0.599 ms - -
GET /up/2 200 0.165 ms - -
send Message per 500ms 2  2
GET /up/1 200 0.428 ms - -
GET /up/1 200 0.182 ms - -
send Message per 500ms 1  2
GET /up/2 200 0.285 ms - -
GET /up/2 200 0.205 ms - -
send Message per 500ms 2  4
GET /up/1 200 0.261 ms - -
GET /up/1 200 0.140 ms - -
delete will be called by  1
{
  '1': null,
  '2': { count: 4, date: 2022-03-25T18:12:14.103Z, queuing: 
false }
}
GET /up/2 200 0.277 ms - -
delete will be called by  2
{ '1': null, '2': null }

*/