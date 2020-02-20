// install express and create app
const express = require ('express');
const app = express();
require('dotenv').config();
const request = require ('superagent');
const cors = require ('cors');

app.use(cors());
app.use((err, req, res, next) => {
    req.rosalie = 'its me, its working';
    next();
});

let lat;
let lng;
let location;

// create location route that reads from query params, gets some dummy data, and returns json
app.get('/location', async(req, respond, next) => {
    try {
        // ins www.cool-api.com?search=portland, `location` will be portland
        location = req.query.search;
        // TODO: HIDE KEY
        const URL = (`https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`);
        const cityData = await request.get(URL);
        const firstResult = cityData.body[0];

        lat = firstResult.lat;
        lng = firstResult.lon;

        respond.json({
            formatted_query: firstResult.display_name,
            latitude: lat,
            longitude: lng,
        });
    } catch (err) {
        next (err);
    }
});

const getWeatherData = async(lat, lng) => {
    const weather = await request.get(`https://api.darksky.net/forecast/${process.env.WEATHER_KEY}/${lat},${lng}`);
    
    return weather.body.daily.data.map (forecast => {
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000),
    }
    }
});

app.get('/weather', async(req, res, next) => {
    // use the lat and lng from earlier to get weather data for the selected area
    try {

        const latLng = await getWeatherData(lat, lng);
    
        res.json(latLng);
    } catch(err) {
        next(err)
    }
});

const getRestData = async (lat,lng) = {
    const yelp = await request.get(`https://api.yelp.com/v3/businesses/search?location=${location}`);

};

app.get('/yelp', async (req, res. next) => {

    try {
        const yelpList = await request.getRestData(location)
    }
})

// const getEventData = async(lat,lng) => {
//     const event = await request.get(``);

//         respond.json {
//                 link: "https://www.eventbrite.com/Angular-Seattle/events/253595182/",
//                 name: "Angular Seattle",
//                 event_date:,
//                 summary: event.summary,
//         }
// };

const errorMessage = ('*', (req, res) => {
    return {
        status: 500,
        responseText: "Sorry, something went wrong"
    }
});

module.exports = {
    app: app,
};

const port = process.env.PORT || 4001;
app.listen(port, () => {
    console.log('listening on port', port);
    }
});