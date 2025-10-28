import { Router } from "express";
import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { requireJwtCookie } from "../middleware/auth.middleware.js";
import environment from '../config/env.config.js';
import passport from 'passport';

const router = Router();

router.post("/register", async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !age || !password) {
        return res.status(400).json({ error: "Todos los datos son requeridos" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email ya registrado" });

    const hash = await bcrypt.hash(password, 10);
    await User.create({ first_name, last_name, email, age, password: hash });

    res.status(201).json({ message: "Usuario registrado" });
});

router.post("/login", (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

        const payload = { sub: String(user._id), email: user.email, role: user.role };
        const token = jwt.sign(payload, environment.JWT_SECRET, { expiresIn: "1h" });

        res.cookie('access_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 60 * 60 * 1000,
            path: '/'
        });

        res.json({ message: "Login OK", user: { email: user.email, role: user.role } });
    })(req, res, next);
});

router.get("/me", requireJwtCookie, async (req, res) => {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ error: "Usuario No encontrado" });
    const { first_name, last_name, email, age, role } = user;
    res.json({ user: { first_name, last_name, email, age, role } });
});

router.post('/logout', (req, res) => {
    res.clearCookie('access_token', { path: '/' });
    res.json({ message: 'Logout Ok' });
});

export default router;
