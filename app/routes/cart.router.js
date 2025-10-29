import { Router } from "express";
import { requireJwtCookie } from "../middleware/auth.middleware.js";
import { cartService } from "../services/cart.service.js";

const router = Router();

router.use(requireJwtCookie);

router.post('/', async (req, res) => {
    const cart = await cartService.createCart(req.user.email);
    res.status(201).json(cart);
});

router.get('/:cid', async (req, res) => {
    const cid = req.params.cid.trim();
    const cart = await cartService.getCartById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart);
});

router.post('/:cid/products/:pid', async (req, res) => {
    const cid = req.params.cid.trim();
    const pid = req.params.pid.trim();
    const { quantity } = req.body;
    try {
        const updatedCart = await cartService.addProduct(cid, pid, quantity);
        res.json(updatedCart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    const cid = req.params.cid.trim();
    const pid = req.params.pid.trim();
    const { qty } = req.body;
    try {
        const updatedCart = await cartService.updateProductQuantity(cid, pid, qty);
        res.json(updatedCart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    const cid = req.params.cid.trim();
    const pid = req.params.pid.trim();
    try {
        const updatedCart = await cartService.removeProduct(cid, pid);
        res.json(updatedCart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/:cid/purchase', async (req, res) => {
    const cid = req.params.cid.trim();
    try {
        const { ticket, order, remainingItems } = await cartService.purchaseCart(cid, req.user.email);

        const formattedNotPurchasable = remainingItems.map(i => ({
            product: i.product,
            requestedQty: i.requestedQty,
            availableStock: i.availableStock,
            message: i.message
        }));

        if (!ticket) {
            return res.status(200).json({
                message: "Compra no realizada. Verificar stock de los productos.",
                notPurchasable: formattedNotPurchasable
            });
        }

        res.json({ ticket, order, notPurchasable: formattedNotPurchasable });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
