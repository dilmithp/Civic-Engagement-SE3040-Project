import axios from 'axios';

export const fetchWeatherForEvent = async (location, date, coordinates = null) => {
    try {
        const API_KEY = process.env.WEATHER_API_KEY;

        if (!API_KEY) {
            console.warn("⚠️ WEATHER_API_KEY is missing!");
            return null;
        }

        let lat, lon;

        // Use coordinates directly if available (from map picker)
        if (coordinates?.lat && coordinates?.lon) {
            lat = coordinates.lat;
            lon = coordinates.lon;
        } else {
            // Fallback to Nominatim geocoding
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
            const geoResponse = await axios.get(geoUrl, {
                headers: { 'User-Agent': 'CivicEngagementApp/1.0' }
            });

            if (!geoResponse.data || geoResponse.data.length === 0) {
                console.warn(`🌍 Could not find coordinates for: ${location}`);
                return null;
            }

            lat = geoResponse.data[0].lat;
            lon = geoResponse.data[0].lon;
        }

        // Fetch forecast
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl);

        const targetTime = new Date(date).getTime();
        const forecasts = weatherResponse.data.list;

        let closestForecast = forecasts[0];
        let smallestDiff = Math.abs(new Date(closestForecast.dt_txt).getTime() - targetTime);

        for (const forecast of forecasts) {
            const diff = Math.abs(new Date(forecast.dt_txt).getTime() - targetTime);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                closestForecast = forecast;
            }
        }

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