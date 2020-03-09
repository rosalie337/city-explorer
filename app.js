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
        };
    });
};

app.get('/weather', async(req, res, next) => {
    // use the lat and lng from earlier to get weather data for the selected area
    try {
        const latLng = await getWeatherData(lat, lng);
        
        res.json({ latLng });
    
    
    } catch (err) {
        next(err);
    }
});

app.get('/yelp', async(req, res, next) => {
    try {
        const yelpList = await request
            .get(`https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lng}`)
            .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`);
        const yelp = yelpList.body.businesses.map (business => {
            return {
                name: business.name,
                image: business.image_url,
                price: business.price,
                rating: business.rating,
                url: business.url,
            };
        });
    
        res.json(yelp);
    } catch (err) {
        next(err);
    }
});

app.get('/eventful', async(req, res, next) => {
    try {
        const eventList = await request
            .get(`http://api.eventful.com/json/events/search?app_key=${process.env.EVENTBRITE_API_KEY}&where=${lat},${lng}&within=25`);
        const eventFul = eventList.body.events.map (event => {
            return {
                link: event.url,
                name: event.title,
                date: event.start_time,
                summary: event.description,

            };
        });

        res.json(eventFul);
    } catch (err) {
        next(err);
    }
});

app.get('/trails', async(req, res, next) => {
    try { 
        const URL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lng}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;
        const trails = await request.get(URL);

        res.json(trails.body);
    } catch (err) {
        next(err);
    }
});

module.exports = {
    app: app,
};

const port = process.env.PORT || 4001;
app.listen(port, () => {
    console.log('listening on port', port);
}
);