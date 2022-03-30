import Strategy from 'passport-local'
import bcrypt from 'bcrypt';
import { db } from '../models/authIndex.js'


export default function (passport) {
  passport.use(new Strategy.Strategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    try {
      const result = await db.User.findOne({ where: { email } });
      if (!result) return done(null, false, { alert: '일치하는 아이디가 존재하지 않습니다.' });

      const hashResult = await bcrypt.compare(password, result.password);
      if (!hashResult) return done(null, false, { alert: '비밀번호가 일치하지 않습니다.' })
      delete result.password;
      return done(null, result);
    } catch (err) {
      console.error(err);
      done(err);
    }
  }))

}
