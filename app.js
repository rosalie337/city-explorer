// install express and create app
const express = require ('express');
const data = require ('./geo.js');
const app = express();
const request = require ('superagent');
const weather = require ('./darksky.js');
const cors = require ('cors');

app.use(cors());

let lat;
let lng;

// create location route that reads from query params, gets some dummy data, and returns json
app.get('/location', (request, respond) => {
    const cityData = data.results[0];

    lat = cityData.geometry.location.lat;
    lng = cityData.geometry.location.lng;

    respond.json({
        formatted_query: cityData.formatted_address,
        latitude: cityData.geometry.location.lat,
        longitude: cityData.geometry.location.lng,
    });
});

const getWeatherData = (lat, lng) => {
    return weather.daily.data.map (forecast => {
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000),
        };
    });  
};
app.get('/weather', (request, respond) => {
    // use the lat and lng from earlier to get weather data for the selected area
    const latLng = getWeatherData(lat, lng);
    
    respond.json(latLng);
});

const port = process.env.PORT || 4001;
app.listen(port, () => {
    console.log('listening on port', port);
});

// app.get('*', (req, res) =>
//     res.send('404')
// }
