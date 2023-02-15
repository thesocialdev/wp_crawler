const domino = require('domino');

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

exports.default = {
    getMapFramesLinks
}