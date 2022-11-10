const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpresError')
const Campground = require('../models/campground')
const { campgroundSchema } = require('../schemas')

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', { campgrounds })
}))

router.get('/new', (req, res) => {
    res.render('./campgrounds/new')
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Succesfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('./campgrounds/show', { campground })
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    res.render(`./campgrounds/edit`, { campground })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) // In an object literal, the spread (...) syntax enumerates the properties of an object and adds the key-value pairs to the object being created. they make a javascript object into an object that mongoose can accept
    req.flash('success', 'Succesfully updated campground')
    res.redirect(`./${campground.id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))


module.exports = router;