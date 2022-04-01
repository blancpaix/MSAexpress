import express from 'express';
import { isActivate, notActivate, isOwn } from './middlewares/sessionChecker.js'

import { db } from '../models/PayIndex.js';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/items', async (req, res, next) => {
  try {
    const itemList = await db.Item.findAll({
      attributes: [
        'itemUID',
        'title',
        'price',
        'discription',
        'img',
        'manager',
        'updatedAt'
      ],
      limit: 8,
      where: {
        deletedAt: {
          [Op.is]: null
        }
      }
    });
    if (itemList && itemList.length) {
      res.status(200).send(itemList);
    } else {
      res.send('empty');
    }
  } catch (err) {
    console.error('Error! /pay/item ', err);
    next(err);
  }
});

router.post('/item', isActivate, async (req, res, next) => {
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

      const result = await db.Item.create(item, { field: ['title'] });
      if (result) {
        res.status(200).send(result.itemUID.toString());
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

// router.route()로 Post를 정상적으로 사용하기 어려움
router.route('/item/:itemId')
  .get(isActivate, async (req, res, next) => {
    try {
      const item = await db.Item.findOne({
        where: { itemUID: req.params.itemId }
      });

      res.send(item);
    } catch (err) {
      console.error('Error! /pay/item/:id', err);
      next(err);
    }
  })
  .post(isOwn, async (req, res, next) => {
    try {
      const result = await db.Item.update({ state: 0 }, {
        where: {
          itemUID: req.params.itemId
        }
      });
      if (result) {
        res.send(true);
      } else {
        res.send(false);
      }
    } catch (err) {
      console.error('Error! POST /pay/item/:itemId', err);
      next(err);
    }
  })
  .patch(isOwn, async (req, res, next) => {
    try {
      const updateSet = req.body;
      const result = await db.Item.update(updateSet, {
        where: { itemUID: req.params.itemId }
      });
      if (result) {
        res.send(true);
      } else {
        res.send(false);
      };
    } catch (err) {
      console.error('Error! PATCH /pay/item/:itemId', err);
      next(err);
    }
  })
  .delete(isOwn, async (req, res, next) => {
    try {
      const result = await db.Item.destroy({
        where: { itemUID: req.params.itemId }
      });
      console.log('delete result', result);

      if (result) {
        res.send(true);
      } else {
        res.send(false);
      }
    } catch (err) {
      console.error('Error! DELETE /pay/item/itemId')
    }
  });


export default router;