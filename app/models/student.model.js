import mongoose from "mongoose";

const studentShema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    age: {
        type: Number,
        required: false,
        min: 0
    },

}, { timestamps: true });

export const Student = mongoose.model('Student', studentShema);