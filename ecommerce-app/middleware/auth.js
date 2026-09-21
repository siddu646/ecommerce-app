// middleware/auth.js
// Simple session-based auth guard for API routes that require a logged-in user.

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'You must be logged in to do that.' });
}

module.exports = { requireAuth };
