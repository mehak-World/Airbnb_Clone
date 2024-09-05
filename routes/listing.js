const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("../errors/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingSchema = require("../utils/listingValidation.js")
const Review = require("../models/review.js");
const reviewSchema = require("../utils/reviewValidation.js");
const {index, renderNewForm, renderListing, createNewListing, renderEditForm, updateListing, deleteListing } = require("../controllers/listings.js")

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

router.route("/")
.get(wrapAsync(index))
.post(is_logged_in, listingValidation, createNewListing)

router.get("/create",is_logged_in, renderNewForm )

router.route("/:id")
.get(wrapAsync(renderListing))
.post(is_logged_in, listingValidation, updateListing)


router.get("/:id/edit", is_logged_in, isOwnerMiddleware, renderEditForm);
router.get("/:id/delete", is_logged_in, isOwnerMiddleware, wrapAsync(deleteListing));


module.exports = router;