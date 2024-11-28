
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).send('Forbidden');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }

    // Set user object in req
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  });
};

exports.authAdmin = (req, res, next) => {
  const { role } = req.user;

  if (role !== 'admin' && role !== 'super-admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};

exports.authSuperAdmin = (req, res, next) => {
  const { role } = req.user;
  console.log(role)

  if (role !== 'super-admin') {
    return res.status(403).json({ message: 'Access denied. Super-Admins only.' });
  }

  next();
};

  