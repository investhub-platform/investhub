import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server misconfigured' });
    }

    const decoded = jwt.verify(token, secret);
    // Attach user info from token payload; ensure token includes id
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email
    };
    next();
  } catch (err) {
    console.error('Auth error', err.message);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

export default { protect };
