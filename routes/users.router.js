import { Router } from "express";
import { User } from '../config/models/user.model.js';
import bcrypt from "bcrypt";
import { requireJwtCookie, requireRole } from "../middleware/auth.middlewar.js";

const router = Router();

router.use(requireJwtCookie, requireRole('admin'));

router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password').lean(); 
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').lean();
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password, role } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "Email ya registrado" });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ first_name, last_name, email, age, password: hash, role });

        res.status(201).json({ message: "Usuario creado con éxito", user: { ...user.toObject(), password: undefined } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { password, email, ...rest } = req.body;

        if (password) {
            rest.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(req.params.id, { ...rest, email }, { new: true, runValidators: true }).select('-password').lean();
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        res.status(200).json({ message: "Usuario actualizado con éxito", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id).lean();
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
