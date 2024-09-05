const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require("../models/Listing.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("../errors/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingSchema = require("../utils/listingValidation.js")
const Review = require("../models/review.js");
const reviewSchema = require("../utils/reviewValidation.js");
const {createReview, deleteReview, updateReview} = require("../controllers/reviews.js")

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


router.post("/", createReview)

router.route("/:review_id")
.get(is_logged_in, deleteReview)
.post( is_logged_in, reviewValidation, updateReview)

module.exports = router;
