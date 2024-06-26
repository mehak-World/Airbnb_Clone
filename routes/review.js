const express = require("express");
const router = express.Router({mergeParams: true});
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

const reviewValidation = (req, res, next) => {
    const result = reviewSchema.validate(req.body);
    if(result.error){
        next(result.error);
    }
    next();
}


router.post("/", async (req, res) => {
    try{
    const id = req.params.id;
    const listing = await Listing.findById(id);
    const {review} = req.body;
    const newReview = new Review(review);
    newReview.author = req.user.username;
    const result = await newReview.save();
    console.log(listing);
    console.log(result);
   listing.reviews.push(result);
   
   await listing.save();
   req.flash("success", "The review has been successfully created");
    res.redirect(`/listings/${req.params.id}`);
    }
    catch(err){
        req.flash("error", err.message);
        res.redirect(`/listings/${req.params.id}`);
    }
})
router.get("/:review_id", is_logged_in, async (req, res) => {
    const {id, review_id} = req.params;
    const listing = await Listing.findById(id);
    const review = await Review.findById(review_id);
    if(review.author === req.user.username){
        const deletedReview = await Review.findByIdAndDelete(review_id);
        const index = listing.reviews.indexOf(review_id);
        delete listing.reviews[index];
        await listing.save();
        req.flash("success", "Your review has been successfully deleted");
        res.redirect(`/listings/${id}`);
    }
    else{
        req.flash("error", "You do not have the permission to delete this review");
        res.redirect(`/listings/${id}`);
    }

});

router.post("/:review_id", is_logged_in, reviewValidation, async (req, res) => {
    const {id, review_id} = req.params;
    const {review} = req.body;
    const found_review = await Review.findById(review_id);
    if(found_review.author === req.user.username){
    const newReview = await Review.findByIdAndUpdate(review_id, review, {runValidators: true});
    req.flash("success", "Your review has been updated");
    res.redirect(`/listings/${id}`);
    }
    else{
        req.flash("error", "You do not have the permission to edit this review");
        res.redirect(`/listings/${id}`);
    }
})

module.exports = router;
