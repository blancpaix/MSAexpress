import local from './passportLoacalStrategy.js';
import { RedisConn } from './RedisConnector.js';

// 들어온 req값을 추가적으로 사용하도록 값들 지정
// req.session 은 외부에서 들어오기때문에 사용하지 마시고 req.user 사용하세요

// Redis에 Sesson data 저장, 간략할수록 좋음
// 세션은 SessionID 로 확인
export default function (passport) {
  passport.serializeUser((user, done) => {
    process.nextTick(() => {
      const storeUser = {
        userUID: user.userUID,
        email: user.email,
        displayname: user.displayname,
        role: user.role,
      };
      done(null, storeUser);
    })
  });

  // user 정보 req.user에 붙여 사용가능하게 만듦
  passport.deserializeUser((req, x, done) => {
    RedisConn.get("sess:" + req.sessionID, (err, result) => {
      if (err) {
        console.error('|REDIS| Error! caanot get a session', err);
        done(err);
      };
      done(null, result);
    });
  });

  local(passport);
}

