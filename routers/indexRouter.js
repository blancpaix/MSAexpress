import express from 'express';

const countObject = {};
const CACHE_TTL = 1000 * 5;

const router = express.Router();

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