const mongoose = require("mongoose");
const Listing = require("../models/Listing.js");
const {data} = require("./data.js");

main().then((res) => console.log("Connection with Mongo DB established")).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/WonderWithUs');
}

const createListing = async () => {
    await Listing.deleteMany({});
    const listings = await Listing.insertMany(data);
    console.log(listings);
}

createListing();