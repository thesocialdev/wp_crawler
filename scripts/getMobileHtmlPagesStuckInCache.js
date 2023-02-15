const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { run } = require("../lib/script-utils").default
const { querySearch } = require("../lib/search").default

const saveToJSON = (objectToSave, dir = "", truncate = true) => {
    const outputDir = path.join(__dirname, `../output/${dir}`);
    // truncate file first
    
    if (truncate) {
        fs.writeFileSync(path.join(outputDir, 'es-vandalism.json'), "");
    }
    return mkdirp(outputDir).then(() => {
        fs.appendFileSync(path.join(outputDir, 'es-vandalism.json'), JSON.stringify(objectToSave) + "\r\n", (err) => {
            if (err) throw err;
        });
    });
}

const mobileHtmlUrlBuild = (lang, project, title) => `https://restbase.discovery.wmnet:7443/${lang}.${project}.org/v1/page/mobile-html/${title}`

const recurseiveQueryAndSaveToFile = async ({ lang, project, params }, truncate = true) => {
    return await querySearch({ lang, project }, params).then(
        async (result) => {
            const { query } = result
            const { pages } = query
            const { transcludedin } = pages[0];
            await Promise.all(transcludedin.map(transcludedPage => {
                return saveToJSON({
                    ...transcludedPage,
                    url: `https://${lang}.${project}.org/wiki/${normalizeTitle(transcludedPage.title)}`,
                    mobileHtmlUrl: mobileHtmlUrlBuild(lang, project, encodeURI(normalizeTitle(transcludedPage.title))),
                }, "", truncate)
            }))
            if (result?.continue) {
                console.info(`[INFO] ticontinue ${result?.continue?.ticontinue}`)
                return await recurseiveQueryAndSaveToFile({
                    lang, 
                    project,
                    params: {
                        ...params,
                        ticontinue: result?.continue?.ticontinue
                    }
                }, "" , false)
            } else {
                return true
            }
        }
    )
}

run(async () => {
    const lang = "es"
    const project = "wikipedia"
    const params = {
        action: "query",
        format: "json",
        prop: "transcludedin",
        list: "",
        titles: "Plantilla:Ficha de persona",
        formatversion: 2,
        tilimit: 500,
    }
    await recurseiveQueryAndSaveToFile({lang, project, params})
});