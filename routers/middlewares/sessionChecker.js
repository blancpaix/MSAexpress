export function isActivate(req, res, next) {
  // console.log('req.user in SessionCheck.js', req.user);
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('Sign in required.');
  }
}

export function notActivate(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('Sign out required.');
  }
};

// session의 email값과 req.body의manager값 일치
export function isOwn(req, res, next) {
  if (req.isAuthenticated()) {
    const userData = JSON.parse(req.user);
    const manager = req.body.manager;
    if (!!manager && userData.passport.user.email === manager) {
      next();
    } else {
      res.status(400).send('Unauthorized Access.');
    }
  } else {
    res.status(401).send('Unauthorized Access.');
  }
};