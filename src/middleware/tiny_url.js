const axios = require('axios');

// Bitly API Access Token (Hardcoded)


async function shortenURL(longURL) {
  try {
    const BITLY_ACCESS_TOKEN = '5eoj2UxqbIuyWbmBWSEp6fJi7kTRwYXnDa0rjRMqxi9YBLm5vqt6FX2ls6N9';
    const response = await axios.post('https://api.tinyurl.com/create', {
        url: longURL,
        domain: 'tinyurl.com'
    }, {
        headers: {
            'Authorization': `Bearer ${BITLY_ACCESS_TOKEN}`, // Replace with your TinyURL API key
            'Content-Type': 'application/json'
        }
    });
    console.log('Shortened URL:', response.data.data.tiny_url);
    return response.data.data.tiny_url;


}
catch (error) {
    console.error('Error shortening URL:', error.response ? error.response.data : error.message);
}
}

module.exports = {shortenURL}; // Export the shortenURL function
