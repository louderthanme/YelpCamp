const mongoose = require('mongoose');
const Review = require('./review');  //pasing in the review model so that when deleting the middleware knows wtf a review is.
const Schema = mongoose.Schema

// https://res.cloudinary.com/drrtkq22t/image/upload/w_300/v1669248091/Yelp%20Camp/a2ifaak999qyqfa5b5n9.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () { //virtuals allow me to add properties to a schema without actually adding them to the database. We are deriving it from info in the database already. No need to duplicate info.
    return this.url.replace('/upload', '/upload/h_300')
})

const opts = { toJSON: { virtuals: true } };  // doing this becaue mongo by default doesnt return the virtuals on the result object when making them into JSON, so in im setting them to appear with this opts variable which I'll then add on the schema



const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        "type": {
            type: String, // could be linestring, polygon, multipoint, point, etc
            enum: ['Point'], // enum is how we provide different options, if it only has one type in there, in this case point, i'm saying the type hast o be this one in particular
            required: true
        },
        coordinates: {
            type: [Number], //array of numbers.
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId, //this is telling me that an objectId belongs here and that we are going to source it from: User, which I'm requiring up top.
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts); // this is the options that set the virtuals as available in the result object after stringifyingin them // jsoninfyinghtme

CampgroundSchema.virtual('properties.popUpMarkup').get(function () { //virtuals allow me to add properties to a schema without actually adding them to the database. We are deriving it from info in the database already. No need to duplicate info.
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`
})

//I'm adding this post hook inside the campgroundschema before compiling it to say: when involved with this particulary model (campground.js) anytime this following middleware is triggered (findOneAndDelete) do the following. This middleware is triggered by the method  findByIdAndDelete. It's that one specifically just because in my delete route in my index I specified I wanted to use that one. Which means that if I used with a different method to delete it then I would have to change this post hook because the middleware that other hypothetical way I'm deleting would probably trigger a different

CampgroundSchema.post('findOneAndDelete', async function (doc) { //doc refers to the thing that was deleted by the findByIdAndDelete method
    //findOneAndDelete is the name of the middleware that is triggered when i use the findByIdAndDelete method, by adding this 'post' hook I'm asking mongoose to do this right after the findOneAndDelete middleware is triggered, since it's middleware it will run EVERY time that that middleware is called.
    if (doc) { // if we did find a doc (delete the thing) then
        await Review.deleteMany({   //remove instances of the Review model. Which instances? well the ones with ids found in ($in-mongoose operator) the deleted doc, the portion of reviews (the object ids in the array of reviews) still exists before this
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema); // this is where the model is compiled. The pre/post hooks must be defined before compiling the model or else they won't work
