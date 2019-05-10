const axios = require('axios');
const delay = require('util').promisify(setTimeout);

let totalRequests = 0;
let countRequests = 0;

const REQUEST_TIMEOUT = 2000;
const get = async (url) => {
    // Throttling number of requests to avoid 429 HTTP errors
    await delay(countRequests >= 200 ? REQUEST_TIMEOUT : 0);
    countRequests = countRequests >= 200 ? 0 : countRequests+1;
    console.log(countRequests);
    return await axios.get(url);
}


module.exports = {
    get,
}