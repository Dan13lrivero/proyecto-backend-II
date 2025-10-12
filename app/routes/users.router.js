import { Router } from "express";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { requireJwtCookie, requireRole } from "../middleware/auth.middlewar.js";
import mongoose from "mongoose";

const router = Router();

router.use(requireJwtCookie);

router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", requireRole("admin", "user"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });

    const user = await User.findById(id).select("-password").lean();
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (req.user.role !== "admin" && String(req.user._id) !== String(id))
      return res.status(403).json({ error: "Acceso prohibido" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", requireRole("admin"), async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;
    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ error: "Datos incompletos" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email ya registrado" });

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ first_name, last_name, email, age, password: hash, role });
    const userWithoutPassword = (({ password, ...u }) => u)(newUser.toObject());

    res.status(201).json({ message: "Usuario creado", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", requireRole("admin", "user"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });

    if (req.user.role !== "admin" && String(req.user._id) !== String(id))
      return res.status(403).json({ error: "Acceso prohibido" });

    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario actualizado", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: "Usuario no encontrado" });

    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
