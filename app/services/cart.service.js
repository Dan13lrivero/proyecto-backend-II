import Cart from '../models/cart.model.js'; 
import { Product } from '../models/product.model.js'; 
import { Ticket } from '../models/ticket.model.js'; 

export class CartService {
    async createCart(userEmail) {
        const cart = new Cart({ user: userEmail, items: [] });
        await cart.save();
        return cart;
    }

    async getCartById(cid) {
        const cart = await Cart.findById(cid).populate('items.product');
        if (!cart) return null;
        return {
            _id: cart._id,
            user: cart.user,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
            items: cart.items.map(i => ({
                product: i.product,
                qty: i.qty,
                _id: i._id
            }))
        };
    }

    async addProduct(cid, pid, quantity) {
        const cart = await Cart.findById(cid);
        if (!cart) throw new Error('Carrito no encontrado');
        if (!cart.items) cart.items = [];
        const pidClean = pid.trim();
        const existingItem = cart.items.find(i => i.product.toString() === pidClean);
        if (existingItem) {
            existingItem.qty += quantity;
        } else {
            const product = await Product.findById(pidClean);
            if (!product) throw new Error('Producto no encontrado');
            cart.items.push({ product: product._id, qty: quantity });
        }
        await cart.save();
        return this.getCartById(cid);
    }

    async updateProductQuantity(cid, pid, qty) {
        const cart = await Cart.findById(cid);
        if (!cart) throw new Error('Carrito no encontrado');
        if (!cart.items) cart.items = [];
        const pidClean = pid.trim();
        const existingItem = cart.items.find(i => i.product.toString() === pidClean);
        if (existingItem) {
            existingItem.qty = qty;
        } else {
            const product = await Product.findById(pidClean);
            if (!product) throw new Error('Producto no encontrado');
            cart.items.push({ product: product._id, qty });
        }
        await cart.save();
        return this.getCartById(cid);
    }

    async removeProduct(cid, pid) {
        const cart = await Cart.findById(cid);
        if (!cart) throw new Error('Carrito no encontrado');
        if (!cart.items) cart.items = [];
        const pidClean = pid.trim();
        cart.items = cart.items.filter(i => i.product.toString() !== pidClean);
        await cart.save();
        return this.getCartById(cid);
    }

    async purchaseCart(cid, userEmail) {
        const cart = await Cart.findById(cid).populate('items.product');
        if (!cart) throw new Error('Carrito no encontrado');
        if (!cart.items) cart.items = [];

        const purchasedItems = [];
        const remainingItems = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (product && product.stock >= item.qty) {
                product.stock -= item.qty;
                await product.save();
                purchasedItems.push(item);
            } else {
                remainingItems.push({
                    product: {
                        _id: item.product._id,
                        title: item.product.title,
                        price: item.product.price,
                        stock: item.product.stock
                    },
                    requestedQty: item.qty,
                    availableStock: product ? product.stock : 0,
                    message: "Cantidad solicitada excede stock disponible"
                });
            }
        }

        let ticket = null;

        if (purchasedItems.length > 0) {
            const totalAmount = purchasedItems.reduce(
                (acc, it) => acc + it.qty * it.product.price,
                0
            );

            ticket = await Ticket.create({
                code: `T-${Date.now()}`,
                purchaser: userEmail,
                amount: totalAmount,
                items: purchasedItems.map(it => ({
                    product: it.product._id,
                    title: it.product.title,
                    qty: it.qty,
                    unitPrice: it.product.price
                }))
            });
        }

        cart.items = remainingItems.map(i => ({ product: i.product._id, qty: i.requestedQty }));
        await cart.save();

        return { ticket, remainingItems };
    }
}

export const cartService = new CartService();
