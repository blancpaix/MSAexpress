export function isActivate(req, res, next) {
  // console.log('req.user in SessionCheck.js', req.user);
  if (req.isAuthenticated()) return next();
  return res.status(403).send('로그인이 필요합니다.');
}

export function notActivate(req, res, next) {
  if (!req.isAuthenticated()) return next();
  return res.status(403).send('로그아웃이 필요합니다.');
};

// session의 email값과 req.body의 manager값 일치
export function isOwn(req, res, next) {
  if (req.isAuthenticated()) {
    const userData = JSON.parse(req.user);
    const manager = req.body.manager;
    if (!!manager && userData.passport.user.email === manager) {
      return next();
    }
  }
  return res.status(401).send('권한이 없습니다.');
};

export function isAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    const user = JSON.parse(req.user);
    if (user.passport.user.role === 3) return next();
  };

  return res.status(401).send('권한이 없습니다.');
};