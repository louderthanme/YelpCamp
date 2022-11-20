const Campground = require('../models/campground')
const Review = require('../models/review')


module.exports.addReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await Promise.all([review.save(), campground.save()])  // awaiting two things at once
    req.flash('success', `Succesfully added review to ${campground.title}`)
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }) //first find the campground with the ID, then pass in an object that uses the $pull mongoose operator to pull from an existing array every value taht matches my condition, in this case the condition is having the specific reviewID from the button i'm pressing
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}

