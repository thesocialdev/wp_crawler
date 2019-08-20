const fs = require('fs');
const querystring = require('querystring');
const mwapi = require('./lib/mwapi');
const delay = require('util').promisify(setTimeout);

const mapping = JSON.parse(fs.readFileSync('mapping.json'));
const missing = [];
 //mapping = {
     //'Q1': 1,
     //'QAB8': 2,
// }
const ids = Object.keys(mapping);

let totalMissing = 0;
let totalSuccess = 0;
let total = 0;

const project = 'www.wikidata.org';

const checkWikidataID = async (wdIds) => {
    let params = {
        action: 'query',
        format: 'json',
    }
    const results = await mwapi.getBatched(`https://${project}/w/api.php?`,params, wdIds);
    results.forEach(result => {
        const pages = Object.values(result);
        pages.forEach(page => {
            console.log(`missing`, typeof page.missing)
            if (typeof page.missing !== 'undefined') {
                console.log(`${page.title} is missing`);
                let missingObject = {}
                missingObject[`${page.title}`] = mapping[`${page.title}`];
                missing.push(missingObject);
                totalMissing++;
            } else {
                console.log(`${page.title} was succesfully fetched`);
                totalSuccess++;
            }
            total++;
        })
    })
}

const IDS_CHUNK = 8000;

const main = async () => {
    let hrstart = process.hrtime();
    const len = ids.length;
    for (i=0; i <= len; i=i+IDS_CHUNK) {

        j=i+IDS_CHUNK;
        if (j >= len) {
            j = len;
        }
        await checkWikidataID(ids.slice(i,j));
        console.log(i, j, len);
        delay(4000);
    }
    hrend = process.hrtime(hrstart)

    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    console.info('Final Report')
    console.info('------------')
    console.info('Success =', totalSuccess);
    console.info('Missing =', totalMissing);
    console.info('% missing =', totalMissing/total*100);
    console.info('------------')
    console.info('Dumping missing JSON to file')
    fs.writeFileSync('missing.json', JSON.stringify(missing), (err) => {
        if (err) throw err;
        console.info('Missing file JSON dump complete')
    })
}

main();