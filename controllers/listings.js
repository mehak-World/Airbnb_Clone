const Listing = require("../models/Listing.js")
const Review = require("../models/review.js")

module.exports.index = async (req, res) => {
    console.log(req.user);
    const result = await Listing.find();
    res.render("listings/index", {listings: result});
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/create.ejs");
}

module.exports.renderListing = async (req, res, next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    console.log(listing);
    if(!listing){
        next(new ExpressError(400, "Bad Request! No such listing found"))
    }
    res.render("listings/show", {listing});
}

module.exports.createNewListing = async (req, res) => {
    const {listing} = req.body;
    const newListing = new Listing(listing)
    newListing.owner = req.user.username;
    const result = await newListing.save();
    req.flash("success", "Listing has been successfully created.");
    console.log(result);
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res, next) => {
    res.render('listings/edit');
}

module.exports.updateListing = async (req, res, next) => {

    const {listing} = req.body;
    const {id} = req.params;
    const newListing = await Listing.findByIdAndUpdate(id, listing, {new: true, runValidators: true});
    await newListing.save();
    req.flash("success", "The listing has been successfully updated");
    console.log(newListing);
    res.redirect(`/listings/${id}`);

}

module.exports.deleteListing = async (req, res) => {

    const {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    const reviews = deletedListing.reviews;
    req.flash("success", "The listing has been successfully deleted");
    await Review.deleteMany({ _id: { $in: reviews } });
    res.redirect("/listings");
}