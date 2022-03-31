import express from 'express';
import { isActivate, notActivate } from './middlewares/sessionChecker.js'

import { db } from '../models/PayIndex.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.end('access to /pay ');
});

router.get('/item/:id', async (req, res) => {
  try {
    const item = await db.Item.findOne({ where: { itemUID: req.params.id } });

    res.send(item);
  } catch (err) {
    console.error('Error! /pay/item/:id', err);
    next(err);
  }
})

router.post('/item', isActivate, async (req, res) => {
  const { title, price, discription, count, img } = req.body;
  const manager = req.session.passport.user.email;
  try {
    if (title && price && count && manager) {
      const item = {
        title,
        price,
        count,
        img,
        discription,
        manager,
      };

      console.log('item??', item);

      const result = await db.Item.create(item, { field: ['title'] });

      if (result) {
        console.log('성공을 했따는데?', result);
        res.send(true);
      } else {
        res.send(false);
      }
    } else {
      res.status(403).send('Bad request.')
    }

  } catch (err) {
    console.error('Error! /pay/item', err);
  }
});


router.get('/active', isActivate, (req, res) => {
  console.log('req.user', req.user);

  res.send('/active test');
});

router.get('/deactive', notActivate, (req, res) => {
  console.log('req.user', req.user);

  res.send('/deactive test');
});

router.get('/alpha', (req, res) => {
  res.send('access to alpha');
});


export default router;
