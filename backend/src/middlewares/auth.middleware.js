import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
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

    // Try to load a User model (may not exist in this branch).
    let UserModel = null;
    try {
      // dynamic import so missing file won't crash startup
      // eslint-disable-next-line global-require
      const imported = await import('../models/User.js');
      UserModel = imported.default || imported.User || null;
    } catch (e) {
      UserModel = null;
    }

    if (UserModel) {
      try {
        const userDoc = await UserModel.findById(decoded.id).lean();
        if (userDoc) {
          req.user = {
            id: String(userDoc._id),
            name: userDoc.name || decoded.name,
            email: userDoc.email || decoded.email
          };
        } else {
          // fall back to token payload
          req.user = { id: decoded.id, name: decoded.name, email: decoded.email };
        }
      } catch (e) {
        req.user = { id: decoded.id, name: decoded.name, email: decoded.email };
      }
    } else {
      // No User model available — attach token payload
      req.user = { id: decoded.id, name: decoded.name, email: decoded.email };
    }

    return next();
  } catch (err) {
    console.error('Auth error', err.message);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

export default { protect };
