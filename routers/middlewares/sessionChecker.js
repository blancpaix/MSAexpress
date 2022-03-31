export function isActivate(req, res, next) {
  // console.log('req.user in SessionCheck.js', req.user);
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('Sign in required!');
  }
}

export function notActivate(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('Sign out required!');
  }
};

export function isOwn(req, res, next) {
  const userData = JSON.parse(req.user);
  console.log('data?', userData, userData.passport.user.userUID);
  next()
};