export function isActivate(req, res, next) {
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
}