const express = require('express')
const router = express.Router({ mergeParams: true }); //gives me access to params caught in app.use in /index
const reviews = require('../controllers/reviews') //this gives me access to a campgrounds object with a bunch of methods on it.
const Campground = require('../models/campground')
const Review = require('../models/review')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync');
const { addReview } = require('../controllers/reviews');



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.addReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;
