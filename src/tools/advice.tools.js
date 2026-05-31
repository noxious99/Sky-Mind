const getAdvice = ({temp, rainProb}) => {
    if (rainProb > 70) {
        return {
            umbrella: true,
            message: "High chance of rain. Bring an umbrella."
        };
    }

    if (temp > 32) {
        return {
            umbrella: false,
            message: "Very hot. Wear light clothes and stay hydrated."
        };
    }

    if (temp > 25) {
        return {
            umbrella: false,
            message: "Pleasant weather. Light clothing is fine."
        };
    }

    return {
        umbrella: false,
        message: "Cool weather. Consider a light jacket."
    };
}

module.exports = { getAdvice };