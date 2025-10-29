import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, index: true },
    purchase_datetime: { type: Date, default: () => new Date(), required: true },
    amount: { type: Number, required: true, min: 0 },
    purchaser: { type: String, required: true },
    products: {
        type: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                title: { type: String, required: true },
                qty: { type: Number, required: true, min: 1 },
                unitPrice: { type: Number, required: true, min: 0 }
            }
        ],
        default: []
    }
}, { timestamps: true });

export const Ticket = mongoose.model("Ticket", ticketSchema);
