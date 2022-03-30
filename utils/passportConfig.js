import local from './passportLoacalStrategy.js';
import { RedisConn } from './RedisConnector.js';

// 들어온 req값을 추가적으로 사용하도록 값들 지정

// Redis Sesson Store 저장, 간략할수록 좋음
// 세션은 SessionID 로 확인
export default function (passport) {
  passport.serializeUser((user, done) => {
    process.nextTick(() => {
      const storeUser = {
        userUID: user.userUID,
        email: user.email,
        displayname: user.displayname,
        point: user.point
      };
      done(null, storeUser);
    })
  });

  // user 정보 req.user에 붙여 사용가능하게 만듦
  passport.deserializeUser((req, x, done) => {
    RedisConn.get("sess:" + req.sessionID, (err, result) => {
      if (err) {
        console.error('|REDIS| get session data Error', err);
        done(err);
      };
      done(null, result);
    });
  });

  local(passport);
}

