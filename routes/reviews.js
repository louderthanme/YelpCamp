const express = require('express')
const router = express.Router({ mergeParams: true }); //gives me access to params caught in app.use in /index
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpresError')
const { reviewSchema } = require('../schemas')
const Campground = require('../models/campground')
const Review = require('../models/review')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.post('/', validateReview, catchAsync(async (req, res) => {
    console.log(req.params.id)
    const campground = await Campground.findById(req.params.id);
    console.log(campground)
    const review = new Review(req.body.review)
    console.log(campground)
    campground.reviews.push(review)
    await Promise.all([review.save(), campground.save()])  // awaiting two things at once
    req.flash('success', `Succesfully added review to ${campground.title}`)
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }) //first find the campground with the ID, then pass in an object that uses the $pull mongoose operator to pull from an existing array every value taht matches my condition, in this case the condition is having the specific reviewID from the button i'm pressing
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;
