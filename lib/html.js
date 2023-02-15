const request = require('request');

const throttledRequest = require('throttled-request')(request);
const throttleConfig = {
    requests: 15,
    milliseconds: 500
};
throttledRequest.configure(throttleConfig);


const getHtmlPage = async ({ hostname, title, lang, project }) => {
    const uriHostname = hostname ? hostname : `${lang}.${project}.org`
    const uri = `https://${uriHostname}/api/rest_v1/page/html/${title}`;
    return new Promise((resolve) => {
        throttledRequest({ method: "GET", uri, encoding: null }, function(err, res){
            if (err) {
                console.error(err);
                return {};
            }
            resolve(res);
        });
    });
}
const getMobileHtmlPage = async ({ hostname, title, lang, project, uri }) => {
    const uriHostname = hostname ? hostname : `${lang}.${project}.org`
    uri = uri ?? `https://${uriHostname}/api/rest_v1/page/html/${title}`;
    return new Promise((resolve) => {
        throttledRequest({ method: "GET", uri, encoding: null }, function(err, res){
            if (err) {
                console.error(err);
                return {};
            }
            resolve(res);
        });
    });
}

exports.default = {
    getHtmlPage,
    getMobileHtmlPage
}
