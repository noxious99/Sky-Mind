import axios from "axios";

export const getCoordinates = async ({city}) => {
    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;

    const { data } = await axios.get(url);

    if (!data.results?.length) {
        throw new Error("City not found");
    }

    const res = data.results[0];

    return {
        city: res.name,
        lat: res.latitude,
        lon: res.longitude
    };
}