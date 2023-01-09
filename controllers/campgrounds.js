const Campground = require('../models/campground')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding") //mapbox requirement could be other service, could require more than one 
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }) // this has the methods we want, forward and reverse geocode.

const cloudinary = require('../cloudinary')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('./campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, // this particular name for our location comes from what we named each lil bit on the form
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.length ? req.files.map(f => ({ url: f.path, filename: f.filename })) : { url: 'https://res.cloudinary.com/drrtkq22t/image/upload/v1670364997/Yelp%20Camp/No_Image_Available_dcvsug.jpg', filename: 'Yelp Camp/No_Image_Available_dcvsug.jpg' } //for each file return an object with the data.
    campground.author = req.user._id;
    await campground.save();
    console.log(campground.images)
    req.flash('success', 'Succesfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews', //this is what we are achieving in one line in populate('author')
            populate: {
                path: 'author'//Then I nest it to populate again but with a diff path, this time author, present on our reviews model
            }
        })
        .populate('author');
    //this gives me access to usable info from this fields in the campground model. Not their objectId but the actual data.
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('./campgrounds/show', { campground })
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render(`./campgrounds/edit`, { campground })
}


module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) // In an object literal, the spread (...) syntax enumerates the properties of an object and adds the key-value pairs to the object being created. they make a javascript object into an object that mongoose can accept
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))//Push because unlike creating a new campground you don't want to override all files, just add on to it. It's in a different variable because .map returns an array, and pushing an array unto another array wouldn't quite work.
    campground.images.push(...imgs) // then we spread said array so that it can be passed in as key:value pairs individually
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }) //if theres something in my deleteImages part of rq body, then updateOne by pulling from the images we have any file with a filename that is in the req.body.deleteimages// PAY ATTENTION TO CAPITALIZATION  in req.body
    }
    req.flash('success', 'Succesfully updated campground')
    res.redirect(`./${campground.id}`)
}


module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Succesfully deleted campground')
    res.redirect('/campgrounds')
}

