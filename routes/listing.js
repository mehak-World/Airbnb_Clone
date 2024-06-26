const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("../errors/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingSchema = require("../utils/listingValidation.js")
const Review = require("../models/review.js");
const reviewSchema = require("../utils/reviewValidation.js");

const is_logged_in = (req, res, next) => {
    if(req.user){
next()
    }
    else{
        req.flash("error", "You must be logged in to perform this action");
       res.redirect("/login");
    }
}

const isOwnerMiddleware = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }

    if (req.user && req.user.username === listing.owner) {
        res.locals.is_Owner = true;
        res.locals.listing = listing; // Pass the listing to the locals
        return next();
    } else {
        req.flash('error', 'You do not have permission to perform this action');
        return res.redirect(`/listings/${listing.id}`);
    }
};


const listingValidation = (req, res, next) => {
    const result = listingSchema.validate(req.body);
    if(result.error){
        next(result.error);
    }
    next();
}


router.get("/", wrapAsync(async (req, res) => {
    console.log(req.user);
    const result = await Listing.find();
    res.render("listings/index", {listings: result});
}));

router.get("/create",is_logged_in,  (req, res) => {
    res.render("listings/create.ejs");
})

router.get("/:id", wrapAsync(async (req, res, next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    console.log(listing);
    if(!listing){
        next(new ExpressError(400, "Bad Request! No such listing found"))
    }
    res.render("listings/show", {listing});
}));

router.post("/", is_logged_in, listingValidation, async (req, res) => {
    const {listing} = req.body;
    const newListing = new Listing(listing)
    newListing.owner = req.user.username;
    const result = await newListing.save();
    req.flash("success", "Listing has been successfully created.");
    console.log(result);
    res.redirect("/listings");
});

router.get("/:id/edit", is_logged_in, isOwnerMiddleware, async (req, res, next) => {
    res.render('listings/edit', { listing: res.locals.listing });
});

router.post("/:id", is_logged_in, listingValidation, async (req, res, next) => {

        const {listing} = req.body;
        const {id} = req.params;
        const newListing = await Listing.findByIdAndUpdate(id, listing, {new: true, runValidators: true});
        await newListing.save();
        req.flash("success", "The listing has been successfully updated");
        console.log(newListing);
        res.redirect(`/listings/${id}`);

});

router.get("/:id/delete", is_logged_in, isOwnerMiddleware, wrapAsync(async (req, res) => {

    const {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    const reviews = deletedListing.reviews;
    req.flash("success", "The listing has been successfully deleted");
    await Review.deleteMany({ _id: { $in: reviews } });
    res.redirect("/listings");
}));


module.exports = router;