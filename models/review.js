const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        requires: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date(Date.now())
    },
    author:{
        type: String
    }
});

module.exports = mongoose.model('Review', reviewSchema);