const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({ // this particular instance of cloudinary has access to our account via the cloudinary object whose config I just set up before declaring storage. 
    cloudinary, // this object contains my cloud name, key, secret. This process will be VERY similar for other providers as well. This is how you often add the key secret thing to the application and then leave that info hidden and just use the account.
    params: {
        folder: 'Yelp Camp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})

module.exports = {
    cloudinary, // this is what I just explained. I can give myself access to this file and leave it out of github, for example.
    storage   /// and this is how I 
}