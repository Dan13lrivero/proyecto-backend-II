export const policies = (...roles) => (req, rest, next) => {
    if(!req.user) return rest.status(401).json({error: 'No autorizado'});
    if(!roles.includes(req.user.role)) return rest.status(403).json({error: 'Acceso prohibido'});
    next();
}