import CartMongoDAO from "../dao/cart.mongo.dao.js";
import { Order } from "../models/order.model.js";

export class CartService {
    constructor() {
        this.dao = new CartMongoDAO();
    }

    async createCart(userEmail) {
        return await this.dao.create(userEmail);
    }

    async getCartById(cid) {
        const cart = await this.dao.findById(cid);
        if (!cart) return null;
        return {
            _id: cart._id,
            user: cart.user,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
            items: Array.isArray(cart.items)
                ? cart.items.map(i => ({
                    product: i.product,
                    qty: i.qty,
                    _id: i._id
                }))
                : []
        };
    }

    async addProduct(cid, pid, quantity) {
        const cart = await this.dao.findById(cid);
        if (!cart) throw new Error("Carrito no encontrado");
        if (!Array.isArray(cart.items)) cart.items = [];

        const pidClean = pid.trim();
        const existingItem = cart.items.find(i => {
            const prodId = i.product._id ? i.product._id.toString() : i.product.toString();
            return prodId === pidClean;
        });

        if (existingItem) {
            existingItem.qty += quantity;
        } else {
            const product = await this.dao.findProductById(pidClean);
            if (!product) throw new Error("Producto no encontrado");
            cart.items.push({ product: product._id, qty: quantity });
        }

        await this.dao.save(cart);
        return this.getCartById(cid);
    }

    async updateProductQuantity(cid, pid, qty) {
        const cart = await this.dao.findById(cid);
        if (!cart) throw new Error("Carrito no encontrado");
        if (!Array.isArray(cart.items)) cart.items = [];

        const pidClean = pid.trim();
        const existingItem = cart.items.find(i => {
            const prodId = i.product._id ? i.product._id.toString() : i.product.toString();
            return prodId === pidClean;
        });

        if (existingItem) {
            existingItem.qty = qty;
        } else {
            const product = await this.dao.findProductById(pidClean);
            if (!product) throw new Error("Producto no encontrado");
            cart.items.push({ product: product._id, qty });
        }

        await this.dao.save(cart);
        return this.getCartById(cid);
    }

    async removeProduct(cid, pid) {
        const cart = await this.dao.findById(cid);
        if (!cart) throw new Error("Carrito no encontrado");
        if (!Array.isArray(cart.items)) cart.items = [];

        const pidClean = pid.trim();
        cart.items = cart.items.filter(i => {
            const prodId = i.product._id ? i.product._id.toString() : i.product.toString();
            return prodId !== pidClean;
        });

        await this.dao.save(cart);
        return this.getCartById(cid);
    }

    async purchaseCart(cid, userEmail) {
        const cart = await this.dao.findById(cid);
        if (!cart) throw new Error("Carrito no encontrado");
        if (!Array.isArray(cart.items)) cart.items = [];

        const purchasedItems = [];
        const remainingItems = [];

        for (const item of cart.items) {
            const productId = item.product?._id ?? item.product;
            const product = await this.dao.findProductById(productId);

            if (product && product.stock >= item.qty) {
                product.stock -= item.qty;
                await this.dao.updateProduct(product);
                purchasedItems.push({ product, qty: item.qty });
            } else {
                remainingItems.push({
                    product: {
                        _id: product?._id ?? productId,
                        title: product?.title ?? "Desconocido",
                        price: product?.price ?? 0,
                        stock: product?.stock ?? 0
                    },
                    requestedQty: item.qty,
                    availableStock: product?.stock ?? 0,
                    message: "Cantidad solicitada excede stock disponible"
                });
            }
        }

        let ticket = null;
        let order = null;

        if (purchasedItems.length > 0) {
            const totalAmount = purchasedItems.reduce(
                (acc, it) => acc + it.qty * it.product.price,
                0
            );

            ticket = await this.dao.createTicket({
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

            order = new Order({
                buyerName: userEmail.split("@")[0],
                buyerEmail: userEmail,
                items: purchasedItems.map(it => ({
                    productId: it.product._id,
                    title: it.product.title,
                    qty: it.qty,
                    unitPrice: it.product.price
                })),
                total: totalAmount,
                status: "paid"
            });

            await order.save();
        }

        cart.items = remainingItems.map(i => ({
            product: i.product._id,
            qty: i.requestedQty
        }));

        await this.dao.save(cart);

        return { ticket, order, remainingItems, purchasedItems };
    }
}

export const cartService = new CartService();
