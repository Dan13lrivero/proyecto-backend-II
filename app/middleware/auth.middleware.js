import passport from "passport";

export const requireJwtCookie = passport.authenticate('jwt-cookie', { session: false });


export const requireRole = (...roles) => (req, res, next) => {

    if (!req.user) return res.status(401).json({ error: 'No autorizado' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Acceso Prohibido' });
    next();
}