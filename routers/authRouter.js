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
    if (!user) return res.status(401).send(msg);

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

router.post('/dropout', isActivate, (req, res) => {
  try {
    const { phonenum } = req.body;
    const userData = JSON.parse(req.user);
    if (userData.passport.user.phonenum === phonenum) {
      const result = await db.User.destroy({ where: { userUID: userData.passport.user.userUID } });
      if (result) {
        res.send(result.toString());
      } else {
        res.send(false);
      }
    };
    res.send(false);
  } catch (err) {
    console.error('Error!, POST /auth/dropout', err);
    next(err);
  }
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
    next(err);
  }
});

router.post('/findid', notActivate, async (req, res, next) => {
  const { phonenum } = req.body;
  try {
    const result = await db.User.findOne({ where: { phonenum } });
    if (result) {
      res.send(result.email);
    } else {
      res.send('Your account does not exist.')
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// router.post('/findpw', notActivate, async (req, res, next) => {
//   const { email } = req.body;
//   try {
//     const result = await db.User.findOne({ where })
//   } catch (err) {
//     console.error('Error! POST /auth/findpw', err);
//     next();
//   }
// });


export default router;




function logger(req, res, next) {
  console.log('Time : ', Date.now());
  next();
};
router.use(logger);