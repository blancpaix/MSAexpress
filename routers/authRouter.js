import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { isActivate, notActivate } from './middlewares/sessionChecker.js'
import { db } from '../models/authIndex.js';

const router = express.Router();

function logger(req, res, next) {
  console.log('Time : ', Date.now());
  next();
};

router.use(logger);

// Sample test
router.get('/', async (req, res) => {
  console.log(req.session, req.sessionID);
  res.end('you want to join us?');
});


router.post('/signup', notActivate, async (req, res, next) => {
  console.log(req.body);
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

router.get('/active', isActivate, (req, res, next) => {
  console.log(req.user);
  res.send('thisthisthis');
});

router.get('/deactive', notActivate, (req, res, next) => {
  console.log(req.user);
  res.send('deactive');
})

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






router.route('/better/better/:id')
  .get((req, res) => {
    console.log('much better GET!');
    res.end('much better GET!');
  })
  .post((req, res) => {
    console.log('PUT!', req.params);
    res.send(req.params);
  });


export default router;

