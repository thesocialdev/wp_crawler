const request = require('request');
const domino = require('domino');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const allWikis = require("../lib/constants").allWikis;
// const allWikis = ["pt"];

const throttledRequest = require('throttled-request')(request);
const throttleConfig = {
    requests: 15,
    milliseconds: 500
};
throttledRequest.configure(throttleConfig);
// const get = util.promisify(request.get);
const project = "wikipedia";

const baseParams = {
    action: 'query',
    format: 'json',
    formatversion: 2,
    list: 'search',
    srsearch: 'insource:mapframe',
    srlimit: 500
}

let totalPages = 0;

const querySearch = (uri, params) => {
    return new Promise((resolve) => {
        throttledRequest({ method: "GET", uri, qs: params }, function(err, res){
            // console.log("Requesting: " + url)
            if (err) {
                console.error(err);
                return {};
            }
            try {
                resolve(res && res.body && JSON.parse(res.body));
            } catch (e) {
                console.error(e);
                console.log(uri, res.body);
                resolve(undefined);
            }
        });
    });
}

const search = async (lang, params, acc = []) => {
    const body = await querySearch(`https://${lang}.${project}.org/w/api.php`, params);
    // const body = JSON.parse(res.body);
    const { query } = body
    const loadMore = body.continue;
    const { searchinfo } = query;
    if (
        searchinfo &&
        searchinfo.totalhits &&
        searchinfo.totalhits > 0 &&
        !(loadMore && loadMore.continue)
    ) {
        console.info(`${searchinfo.totalhits} totalhits for language ${lang}`);
    }

    const titles = query.search.map((wikipage) => {
        return wikipage.title;
    });

    acc = [
        ...acc,
        ...titles
    ];

    if (loadMore && loadMore.continue) {
        const { sroffset } = loadMore;
        return search(lang, Object.assign(params, { sroffset }), acc);
    }

    return acc;
}

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

const getMapFramesLinks = (html, title) => {
    const links = [];

    const doc = domino.createDocument(html);
    let mapFrames = doc.querySelectorAll(".mw-kartographer-map > img");
    if (mapFrames.length === 0) {
        mapFrames = doc.querySelectorAll(".mw-kartographer-map");
        if (mapFrames.length === 0) {
            // console.log(`${title} has no mapframes`);
        }
        mapFrames.forEach(mapFrame => {
            links.push(mapFrame.style["background-image"].replace(/^/).replace(/^url\("/, "").replace(/"\)$/, ""));
        });
    } else {
        mapFrames.forEach(mapFrame => {
            links.push(mapFrame.src);
        });
    }

    return links;
}

const saveMapsToFile = (maps, dir = "") => {
    if (maps.links.length === 0) {
        console.info(`${dir} have no mapframes`)
        return;
    }
    const outputDir = path.join(__dirname, `../output/${dir}`);
    return mkdirp(outputDir).then(() => {
        fs.writeFileSync(path.join(outputDir, 'results.json'), JSON.stringify(maps), (err) => {
            if (err) throw err;
        });
    });
}

(async () => {
    console.log("Script started")
    for (const lang of allWikis) {
    // for (const lang of ["ak"]) {
        try {
            console.info(`--- BEGIN ${lang} ---`)
            await search(lang, baseParams).then((titles) => {
                return Promise.all(titles.map(async (title) => {
                    return getHtmlPage(encodeURI(title), lang).then(html => {
                        return getMapFramesLinks(html, encodeURI(title));
                    });
                })).then((rawLinks) => {
                    // console.log(rawLinks)
                    const links = rawLinks.reduce((acc, links) => [...acc, ...links], []);
                    console.info(`language ${lang} finished requests to parsoid`)
                    if (links.length) {
                        console.info(`${links.length} links for language ${lang}`);
                    }
                    return saveMapsToFile({
                        lang,
                        links
                    }, lang);
                });
            });
        } catch (e) {
            console.error(`https://${lang}.${project}.org/w/api.php`, e);
        }
        console.info(`--- END ${lang} ---`)
    }
})().then(() => {
    console.log("Script finished")
});
