const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const allWikis = require("../lib/constants").allWikis;
const getHtmlPage = require("../lib/html").getHtmlPage;
const getMapFramesLinks = require("../lib/maps").getMapFramesLinks;
const search = require("../lib/search").search
const project = "wikipedia";

const baseParams = {
    action: 'query',
    format: 'json',
    formatversion: 2,
    list: 'search',
    srsearch: 'insource:mapframe',
    srlimit: 500
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
