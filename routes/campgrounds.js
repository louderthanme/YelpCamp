const express = require('express')
const router = express.Router();
const campgrounds = require('../controllers/campgrounds') //this gives me access to a campgrounds object with a bunch of methods on it.
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

const Campground = require('../models/campground')

const { storage } = require('../cloudinary') // no need to add/  index because node automatically looks for an index file.
const multer = require('multer') //middleware to handle multipart/farm-data in our forms
const upload = multer({
    storage,
    limits: { fileSize: 10000000 }
    //filesize in bytes, in this case it's 1000 kb i.e. 10mb 
});  //where the file will be saved, at the moment it's on this folder, irl you wouldn't save it on a computer you'd upload it to a server

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)) //the upload.array is from cloudinary. It's called 'image' because that's the name I specified on the field of the form where we make a new campground. I'm checking to see if they are logged in first.


router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) // the upload array in this case comes after also checking if the person is the camp's author.
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground))

module.exports = router;