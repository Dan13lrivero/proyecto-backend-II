import passport from "passport";


export const requireJwtCookie = passport.authenticate('jwt-cookie', {session: false});

export const requireRole = (...roles) => (req, rest, next) => {
    if(!req.user) return rest.status(401).json({error: 'No autorizado'});
    if(!roles.includes(req.user.role)) return rest.status(403).json({error: 'Acceso prohibido'});
    next();
}