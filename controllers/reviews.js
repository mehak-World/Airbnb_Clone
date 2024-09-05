const Listing = require("../models/Listing")
const Review = require("../models/review")

module.exports.createReview = async (req, res) => {
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
}



module.exports.deleteReview = async (req, res) => {
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

}

module.exports.updateReview = async (req, res) => {
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
}

