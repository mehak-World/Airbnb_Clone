const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        set: (v) => v === ''? 'https://www.planetware.com/wpimages/2020/07/world-best-luxury-all-inclusive-resorts-four-seasons-tented-camp-golden-triangle-thailand.jpg': v,
        
    },
    location:{
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    owner: {
        type: String
    }
});

// We will create a listing model now:

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;