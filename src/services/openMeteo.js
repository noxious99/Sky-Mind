const axios = require("axios")

const getWeather = async (lat, lon) => {
    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}` +
        `&longitude=${lon}` +
        `&daily=temperature_2m_max,precipitation_probability_max` +
        `&timezone=auto`;

    const { data } = await axios.get(url);
    return data;
}

module.exports = { getWeather }