const request = require('request');
const util = require('util');
const allWikis = require("../../lib/constants").allWikis;
// const allWikis = ["en"];
const throttledRequest = require('throttled-request')(request);
const throttleConfig = {
    requests: 5,
    milliseconds: 500
};
throttledRequest.configure(throttleConfig);

const get = util.promisify(throttledRequest.get);
const params = {
    action: 'query',
    format: 'json',
    formatversion: 2,
    list: 'search',
    srsearch: 'insource:mapframe'
}

let totalPages = 0;

Promise.all(allWikis.map(async (lang) => {
    const res = await get({
        url: `https://${lang}.wikivoyage.org/w/api.php`,
        qs: params
    });
    try {
        const query = JSON.parse(res.body).query
        totalPages += query && query.searchinfo && query.searchinfo.totalhits || 0;
    } catch {
        console.error(`https://${lang}.wikivoyage.org/w/api.php`);
    }
})).then(() => {
    console.log(totalPages)
});

