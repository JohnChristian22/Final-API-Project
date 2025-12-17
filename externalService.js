const axios = require('axios');

const fetchRandomAdvice = async () => {
    try {
        const response = await axios.get(`https://api.adviceslip.com/advice?t=${Date.now()}`); 
        if (response.data && response.data.slip && response.data.slip.advice) {
            return response.data.slip.advice; 
        } else {
            return "Random advice not retrieved.";
        }
    } catch (error) {
        console.error("Error fetching third-party advice:", error.message);
        return "No random advice available right now."; 
    }
};

module.exports = { fetchRandomAdvice };