const fs = require("fs")
const { run } = require("../../lib/script-utils").default
const { querySearch } = require("../../lib/search").default
const vandalizedFile = fs.readFileSync("../output/es-vandalism.json")
console.log(vandalis)



run(async () => {
    const props = ['coordinates', 'description', 'pageprops', 'pageimages', 'revisions', 'info', 'transcludedin'];
    const lang = "es"
    const project = "wikipedia"
    const params = {
        action: 'query',
        prop: props.join('|'),
        titles: "Plantilla:Ficha de persona",
        pilicense: 'any',
        piprop: 'thumbnail|original|name',
        pilangcode: lang,
        pithumbsize: 320,
        rvprop: 'contentmodel',
        rvslots: 'main',
        list: "",
        formatversion: 2,
        tilimit: 10,
    };
    return await querySearch({ lang, project }, params).then(
        async (result) => {
        }
    );
});
