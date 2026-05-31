import { getWeather } from "../services/openMeteo"

export const getDailyWeather = async ({lat, lon}) => {
    const data = await getWeather(lat, lon);

    return {
        temp: data.daily.temperature_2m_max[0],
        rain: data.daily.precipitation_probability_max[0]
    };
}