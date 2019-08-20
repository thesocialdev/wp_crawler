const A = require('axios');
const delay = require('util').promisify(setTimeout);
const querystring = require('querystring');
const http = require('http');
const https = require('https');

const axios = A.create({
    httpAgent: new http.Agent({ 
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 60000, // active socket keepalive for 60 seconds
        freeSocketTimeout: 30000, // free socket keepalive for 30 seconds }),
    }),
    httpsAgent: new https.Agent({ 
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 60000, // active socket keepalive for 60 seconds
        freeSocketTimeout: 30000, // free socket keepalive for 30 seconds }),
    }),
});

let totalRequests = 0;
let countRequests = 0;

const REQUEST_TIMEOUT = 2000;
const REQUEST_LIMIT = 200;
const MAX_BATCH_SIZE = 50;

function _batch(arr, size) {
    const res = [];
    while (arr.length > 0) {
        res.push(arr.splice(0, size));
    }
    return res;
}

const get = async (url) => {
    // Throttling number of requests to avoid 429 HTTP errors
    await delay(countRequests >= REQUEST_LIMIT ? REQUEST_TIMEOUT : 0);
    countRequests = countRequests >= REQUEST_LIMIT ? 0 : countRequests+1;
    console.log(countRequests, REQUEST_LIMIT);
    return await axios.get(url);
}

const getBatched = async (url, params, titles, size = MAX_BATCH_SIZE) => {
    const reqs = _batch(titles, size).map(async (res) => {
        //console.log(`${url}${querystring.stringify(Object.assign(params, { titles: res.join('|') }))}`)
        return await get(`${url}${querystring.stringify(Object.assign(params, { titles: res.join('|') }))}`);
    });
    return Promise.all(reqs).then((response) => {
        return response.reduce((result, batch) => {
            // Check for query or entities, depending on the api action
            const batchResult = (batch.data.query && batch.data.query.pages)
                || batch.data.entities;
            return result.concat(batchResult);
        }, []);
    });
}

module.exports = {
    get,
    getBatched,
}