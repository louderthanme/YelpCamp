const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('C:/Users/ruben/Documents/Programming/YelpCamp/models/campground.js');
const axios = require('axios');

main().catch(err => console.log(`oh no mongo ${err}`));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');
    console.log('database from seeds index connnected');
    console.log('please wait');
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];

async function seedImg() {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: '7pscXf9BhaP0ytKtrkPk3lXo_Or6AWjOm2UeaJaaGEk',
                collections: 1114848,
            },
        })
        return resp.data.urls.small
    } catch (err) {
        console.error(err)
    }
}



const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        // setup
        const placeSeed = Math.floor(Math.random() * places.length);
        const descriptorsSeed = Math.floor(Math.random() * descriptors.length);
        const citySeed = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 25) + 10;

        // seed data into campground
        const camp = new Campground({
            author: '63740e54842e66403ae89ec5',
            title: `${descriptors[descriptorsSeed]} ${places[placeSeed]}`,
            location: `${cities[citySeed].city}, ${cities[citySeed].state}`,
            imageUrl: await seedImg(),
            description:
                "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!",
            price: price,
        });

        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
    console.log('finished')

})