import express from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { customAlphabet } from 'nanoid';

import { isActivate, notActivate } from './middlewares/sessionChecker.js'
import { AuthLogics } from '../logics/authLogic.js';

const router = express.Router();

router.post('/signin', notActivate, (req, res, next) => {
  passport.authenticate('local', (authErr, user, Error) => {
    if (authErr) {
      console.error('Error /auth/signin ', authErr);
      return next(authErr);
    };
    if (!user) return res.status(401).json({ Error });

    return req.login(user, signinErr => {
      if (signinErr) {
        console.error('Error /auth/signin', signinErr);
        return next(signinErr);
      };

      res.status(200).send(true);
    });
  })(req, res, next)
});


router.post('/signout', isActivate, (req, res) => {
  req.logout();
  req.session.destroy(() => res.redirect('/auth'));
});


router.post('/dropout', isActivate, asyncHandler(async (req, res) => {
  const { phonenum, password } = req.body;
  if (typeof phonenum !== "string" || typeof password !== 'string')
    return res.status(412).json({ Error: '전화번호와 비밀번호를 입력해주세요.' })
  const orgPhonenum = phonenum.replace(/[-]+/g, "");

  const userData = await AuthLogics.findUserByPhone(orgPhonenum);
  if (!userData) return res.status(401).json({ Error: '계정을 찾을 수 없습니다.' });
  if (req.session.passport.user.userUID !== userData.userUID) return res.status(403).json({ Error: '계정이 일치하지 않습니다.' });

  const compareResult = await bcrypt.compare(password, userData.password);
  if (userData.phonenum !== orgPhonenum || !compareResult)
    return res.status(403).json({ Error: '비밀번호가 일치하지 않습니다.' });
  await AuthLogics.dropout(userData.userUID);

  req.logout();
  req.session.destroy(
    () => res.status(200).send(true)
    // res.redirect('/')
  );
}));


router.post('/signup', notActivate, asyncHandler(async (req, res) => {
  const { email, password, displayname, phonenum } = req.body;
  if (typeof email !== "string" || typeof password !== "string"
    || typeof displayname !== "string" || typeof phonenum !== "string")
    return res.status(412).json({ Error: '이메일, 비밀번호, 이름, 전화번호를 입력해주세요.' });

  const orgPhonenum = phonenum.replace(/[-]+/g, "");
  const user = await AuthLogics.findUserByEmail(email);
  if (user) return res.status(412).json({ Error: '이미 존재하는 계정입니다.' });
  const hash = await bcrypt.hash(password, 12);

  const result = await AuthLogics.createUser(
    email, hash, displayname, orgPhonenum
  );

  if (!result) return res.status(500).json({ Error: '계정 생성에 실패했습니다. 다시 시도해주세요.' });
  res.status(200).send(true);
  // res.redirect('/auth');
}));


router.post('/findid', notActivate, asyncHandler(async (req, res) => {
  const { phonenum } = req.body;
  if (typeof phonenum !== "string")
    return res.status(412).json({ Error: '전화번호를 입력해주세요.' })
  const orgPhonenum = phonenum.replace(/[-]+/g, "");
  const result = await AuthLogics.findUserByPhone(orgPhonenum);
  if (!result) return res.status(401).json({ Error: '계정이 존재하지 않습니다.' });

  res.json({ email: result.email });
}));


router.post('/findpw', notActivate, asyncHandler(async (req, res) => {
  const { email, phonenum } = req.body;
  if (!email || typeof email !== "string")
    return res.status(412).json({ Error: '등록된 Email을 입력해주세요.' })
  const orgPhonenum = phonenum.replace(/[-]+/g, "");
  const userData = await AuthLogics.findUserByPhone(orgPhonenum);
  if (!userData || userData.phonenum !== orgPhonenum)
    return res.status(403).json({ Error: '사용자 정보가 일치하지 않습니다.' });

  const nanoid = customAlphabet('1234567890abcdef', 8);
  const tempPW = nanoid();
  const hashPW = await bcrypt.hash(tempPW, 12);
  await AuthLogics.updatePassword(email, hashPW);
  const sender = await AuthLogics.sendPasswordMail(email, tempPW);

  res.send(sender);
}));


router.post('/updatepw', isActivate, asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (typeof password !== "string")
    return res.status(412).json({ Error: '전화번호와 비밀번호를 입력해주세요.' });

  const email = req.session.passport.user.email;
  const hashPW = await bcrypt.hash(password, 12);
  await AuthLogics.updatePassword(email, hashPW);

  res.send(true);
}));


router.post('/loadPoint', isActivate, asyncHandler(async (req, res) => {
  const UserUserUID = req.session.passport.user.userUID;
  const { type, remark, load } = req.body;
  if (typeof type !== "string" || typeof remark !== "string"
    || typeof load !== "number" || !UserUserUID)
    return res.status(412).json({ Error: '입력이 잘못되었습니다. 다시 확인해주세요.' });

  const currentPoint = await AuthLogics.createLoadRecord(type, remark, load, UserUserUID);
  if (currentPoint instanceof Error) return res.status(500).json({ Error: currentPoint.message });

  res.status(200).json(currentPoint);
}));



export default router;