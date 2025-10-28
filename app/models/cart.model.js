import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: { type: String, required: true },
    items: {
        type: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                qty: { type: Number, default: 1 }
            }
        ],
        default: []
    }
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
