import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { isActivate, notActivate } from './middlewares/sessionChecker.js'
import { db } from '../models/AuthIndex.js';

// 계층 분리할겨

const router = express.Router();

router.post('/signin', notActivate, (req, res, next) => {
  passport.authenticate('local', (authErr, user, msg) => {
    if (authErr) {
      console.error('Error /auth/signin ', authErr);
      return next(authErr);
    }
    if (!user) res.status(401).send(msg);

    return req.login(user, signinErr => {
      if (signinErr) {
        console.error('Error /auth/signin', signinErr.alert);
        return next(signinErr);
      };

      res.status(200).send(true);
    })

  })(req, res, next)
});

router.post('/signout', isActivate, (req, res) => {
  req.logout();
  req.session.destroy(() => {
    console.log('session destroy!');
    res.redirect('/auth');
  });
});

router.post('/signup', notActivate, async (req, res, next) => {
  const { email, password, displayname, phonenum } = req.body;
  try {
    const user = await db.User.findOne({ where: { email } });
    if (user) res.send('Account already exists.')
    const hash = await bcrypt.hash(password, 12);
    await db.User.create({
      email,
      password: hash,
      displayname,
      phonenum,
    });

    res.send(true);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post('/findid', notActivate, async (req, res, next) => {
  const { phonenum } = req.body;
  try {

  } catch (err) {
    console.error(err);
    return next(err);
  }
})


export default router;




function logger(req, res, next) {
  console.log('Time : ', Date.now());
  next();
};
router.use(logger);