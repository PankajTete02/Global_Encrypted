const axios = require('axios');

// Bitly API Access Token (Hardcoded)
const BITLY_ACCESS_TOKEN = 'c26999d9739a43fe38da73aeadafe65d205a04e8';

async function shortenURL(longURL) {
  try {
    // Shorten the URL using Bitly API
    const response = await axios.post(
      'https://api-ssl.bitly.com/v4/shorten',
      {
        long_url: longURL
      },
      {
        headers: {
          Authorization: `Bearer ${BITLY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const shortURL = response.data.link;
    console.log(shortURL);
    return shortURL; // Return the short URL from the function
  } catch (error) {
    console.error(error);
    throw new Error('Error shortening URL'); // Throw an error instead of using res.status
  }
}

module.exports = shortenURL; // Export the shortenURL function
