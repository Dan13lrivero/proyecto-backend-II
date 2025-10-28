import { Router } from "express";
import { Product } from "../models/product.model.js";
import { requireJwtCookie } from "../middleware/auth.middleware.js";
import { policies } from "../middleware/policies.middleware.js";

const router = Router();

router.use(requireJwtCookie);

router.post("/", policies('admin'), async (req, res) => {
    const { title, price, stock } = req.body;
    const product = await Product.create({ title, price, stock });
    res.status(201).json(product);
});

router.put("/:id", policies('admin'), async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    res.json(product);
});

router.delete("/:id", policies('admin'), async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(204).end();
});

router.get("/", async (_req, res) => {
    const products = await Product.find();
    res.json(products);
});

export default router;
