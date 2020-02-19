// install express and create app
const express = require ('express');
const app = express();
require('dotenv').config();
const request = require ('superagent');
const weather = require ('./darksky.js');
const cors = require ('cors');

app.use(cors());
app.use((err, req, res, next) => {
    req.rosalie = 'its me, its working';
    next();
});

let lat;
let lng;

// create location route that reads from query params, gets some dummy data, and returns json
app.get('/location', async(req, respond, next) => {
    try {
        // ins www.cool-api.com?search=portland, `location` will be portland
        const location = req.query.search;
        // TODO: HIDE KEY
        const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`;
        const cityData = await request.get(URL);
        const firstResult = cityData.body[0];

        lat = firstResult.lat;
        lng = firstResult.lng;

        respond.json({
            formatted_query: firstResult.display_name,
            latitude: lat,
            longitude: lng,
        });
    } catch (err) {
        next (err);
    }
});

const getWeatherData = (lat, lng) => {
    return weather.daily.data.map (forecast => {
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000),
        };
    });  
};
app.get('/weather', (req, res) => {
    // use the lat and lng from earlier to get weather data for the selected area
    const latLng = getWeatherData(lat, lng);
    
    res.json(latLng);
});

app.get('*', (req, res) =>
    res.send('404'));

module.exports = {
    app: app,
};

const port = process.env.PORT || 4001;
app.listen(port, () => {
    console.log('listening on port', port);
});

