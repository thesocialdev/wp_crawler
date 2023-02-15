const request = require('request');

const throttledRequest = require('throttled-request')(request);
const throttleConfig = {
    requests: 15,
    milliseconds: 500
};
throttledRequest.configure(throttleConfig);


const getHtmlPage = async (title, lang) => {
    const uri = `https://${lang}.${project}.org/api/rest_v1/page/html/${title}`;
    return new Promise((resolve) => {
        throttledRequest({ method: "GET", uri, encoding: null }, function(err, res){
            // console.log("Requesting: " + url)
            if (err) {
                console.error(err);
                return {};
            }
            resolve(res && res.body);
        });
    });
}

exports.default = {
    getHtmlPage
}