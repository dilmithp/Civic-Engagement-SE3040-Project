import axios from 'axios';

export const fetchWeatherForEvent = async (location, date) => {
    try {
        const API_KEY = process.env.WEATHER_API_KEY;
        
        if (!API_KEY) {
            console.warn("⚠️ WEATHER_API_KEY is missing in your .env file!");
            return null;
        }

        // 1. Get Coordinates
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`;
        const geoResponse = await axios.get(geoUrl);
        
        if (!geoResponse.data || geoResponse.data.length === 0) {
            console.warn(`🌍 Could not find coordinates for location: ${location}`);
            return null;
        }

        const { lat, lon } = geoResponse.data[0];

        // 2. Fetch Forecast
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl);

        // 3. Find closest forecast to event date
        const targetTime = new Date(date).getTime();
        const forecasts = weatherResponse.data.list;

        let closestForecast = forecasts[0];
        let smallestDifference = Math.abs(new Date(closestForecast.dt_txt).getTime() - targetTime);

        for (const forecast of forecasts) {
            const diff = Math.abs(new Date(forecast.dt_txt).getTime() - targetTime);
            if (diff < smallestDifference) {
                smallestDifference = diff;
                closestForecast = forecast;
            }
        }

        // 4. Return clean data
        return {
            temp: Math.round(closestForecast.main.temp),
            condition: closestForecast.weather[0].main,
            description: closestForecast.weather[0].description
        };

    } catch (error) {
        console.error("🌤️ Weather API Error:", error.message);
        return null; 
    }
};