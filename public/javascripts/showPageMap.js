mapboxgl.accessToken = mapToken; // mapToken is defined at the beginning of running the show page, ejs looks at this and adds that valuye to the mapToken (= process.env.....) etc. I have access to it here because the script that defines it runs before this script runs at the bottom of the page
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat] -- getting campground here the same way I got mapToken. The problems are false positives
    zoom: 15, // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

const marker = new mapboxgl.Marker({ color: 'red', rotation: 45 })
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<br><h5>${campground.title}</h5> <p>${campground.location}</p>`
            )
    )
    .addTo(map);