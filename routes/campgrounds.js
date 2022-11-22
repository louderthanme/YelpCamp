const express = require('express')
const router = express.Router();
const campgrounds = require('../controllers/campgrounds') //this gives me access to a campgrounds object with a bunch of methods on it.
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

const Campground = require('../models/campground')

const multer = require('multer') //middleware to handle multipart/farm-data in our forms
const upload = multer({ dest: 'uploads/' }) //where the file will be saved, at the moment it's on this folder, irl you wouldn't save it on a computer you'd upload it to a server


router.route('/')
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))
    .post(upload.array('image'), (req, res) => {
        console.log(req.body, req.files)
        res.send('it worked')
    })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground))

module.exports = router;