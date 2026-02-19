const dbMiddleware = (req, res, next) => {
  req.db = req.app.locals.db
  next()
}

module.exports = dbMiddleware
