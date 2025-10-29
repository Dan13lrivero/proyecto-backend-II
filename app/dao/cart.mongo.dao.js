import Cart from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import { Ticket } from '../models/ticket.model.js';
import { Order } from '../models/order.model.js';

export default class CartMongoDAO {
    async create(userEmail) {
        const cart = new Cart({ user: userEmail, items: [] });
        return await cart.save();
    }

    async findById(cid) {
        return await Cart.findById(cid).populate('items.product');
    }

    async save(cart) {
        return await cart.save();
    }

    async findProductById(pid) {
        return await Product.findById(pid);
    }

    async updateProduct(product) {
        return await product.save();
    }

    async createTicket(ticketData) {
        return await Ticket.create(ticketData);
    }


    async createOrder(orderData) {
        return await Order.create(orderData);
    }
}
