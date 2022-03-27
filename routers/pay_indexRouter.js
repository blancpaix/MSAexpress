import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.end('access to /pay ');
});

router.get('/alpha', (req, res) => {
  res.send('access to alpha');
});


export default router;
