import express from 'express';
import asyncHandler from 'express-async-handler';
import { isActivate, notActivate, isOwn } from './middlewares/sessionChecker.js'

import { PayLogics } from '../logics/payLogic.js';
import { amqpRequest } from '../utils/mq/RequestFactory.js';

const router = express.Router();

router.get('/items', asyncHandler(async (req, res) => {
  const itemList = await PayLogics.getItems();
  res.status(200).json(itemList);
}));

router.post('/item', isActivate, asyncHandler(async (req, res) => {
  const { title, price, discription, count, img } = req.body;
  if (typeof title !== "string" || typeof price !== "number" || typeof count !== "number")
    return res.status(412).json({ Error: '제품명, 가격, 수량 값을 다시 확인해주세요.' });

  const manager = req.session.passport.user.email;
  const result = await PayLogics.registerItem(title, price, count, img, discription, manager);
  res.status(200).send(result.itemUID.toString());
}));


// router.route()로 Post를 정상적으로 사용하기 어려움
router.route('/item/:itemId')
  .get(isActivate, asyncHandler(async (req, res) => {
    const item = await PayLogics.findItemById(req.params.itemId);
    res.status(200).json(item);
  }))
  .patch(isOwn, asyncHandler(async (req, res) => {
    const { title, price, discription, img } = req.body;
    const patchObj = {};
    if (title && title.length > 0) {
      if (typeof title !== "string") return res.status(412).json({ Error: '제품명이 잘못입력되었습니다.' })
      patchObj.title = title;
    }
    if (price && price > 0) {
      if (typeof price !== "number") return res.status(412).json({ Error: '가격이 잘못입력되었습니다.' })
      patchObj.price = price;
    }
    if (discription && discription.length > 0) {
      if (typeof discription !== "string") return res.status(412).json({ Error: '잘못된 설명이 입력되었습니다.' })
      patchObj.discription = discription;
    }
    if (img && img.length > 0) {
      if (typeof img !== "string") return res.status(412).json({ Error: '이미지 경로를 다시 확인해주세요.' })
      patchObj.img = img;
    }

    const result = await PayLogics.patchItem({ itemUID: req.params.itemId, value: patchObj });
    res.status(200).json(result);
  }))
  .delete(isOwn, asyncHandler(async (req, res) => {
    await PayLogics.deleteItem(req.params.itemId);
    res.send(true);
  }));

router.post('/checkout/:itemUID', isActivate, async (req, res, next) => {
  let purchaseUID = null;
  try {
    const itemUID = req.params.itemUID;
    if (!itemUID) return res.status(412).json({ Error: '상품 번호가 잘못되었습니다.' });
    const userUID = req.session.passport.user.userUID;
    const { count, price, discount, type, remark } = req.body;
    if (typeof count !== "number" || typeof price !== "number" || typeof type !== "string")
      return res.status(412).json({ Error: '결제 수단, 가격, 수량을 다시 확인해주세요.' });

    const selectedItem = await PayLogics.findItemById(itemUID);
    if (!selectedItem)
      return res.status(412).json({ Error: '해당 상품을 찾을 수 없습니다.' });
    if (selectedItem.price !== price)
      return res.status(412).json({ Error: '상품 가격이 일치하지 않습니다.' });
    if (selectedItem.count - count < 0)
      return res.status(412).json({ Error: '재고가 부족합니다.' });

    const result = await PayLogics.recordPurchase(count, price, discount, type, userUID, remark, itemUID);
    purchaseUID = result.idx;

    const reply = await amqpRequest.send('auth_queue', {
      event: 'purchase',
      value: {
        type,
        remark,
        pay: (price * count) - discount,
        purchaseUID,
        userUID,
      }
    });

    if (reply.Error) throw Error(reply.Error);
    res.status(200).json(reply);
  } catch (err) {
    if (purchaseUID) await PayLogics.deletePurchase(purchaseUID);
    console.error('Error! POST /pay/checkout/:itemId]', err);
    next({ code: 412, message: err.message });
  }
});


router.get('/purchases', isActivate, asyncHandler(async (req, res) => {
  const userUID = req.session.passport.user.userUID;
  const result = await PayLogics.getPurchases(userUID);
  res.json(result);
}));

router.get('/purchase/:purchaseUID', isActivate, asyncHandler(async (req, res) => {
  const userUID = req.session.passport.user.userUID;
  const result = await PayLogics.getPurchase(req.params.purchaseUID, userUID);
  res.json(result);
}))





export default router;