/**
 * Independent Backend Role-Based Access Control Middleware
 * Enforces role authorization strictly on API endpoints.
 */
function roleGuard(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Authentication required.',
          code: 'UNAUTHORIZED'
        }
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          status: 403,
          message: `Access Denied: Role '${req.user.role}' is not authorized to access this resource or action. Required: [${allowedRoles.join(', ')}]`,
          code: 'FORBIDDEN_ROLE'
        }
      });
    }

    next();
  };
}

module.exports = {
  roleGuard
};
