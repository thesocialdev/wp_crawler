const path = require("path");
const fs = require("fs")
const results = require("../output/results.json");


const snapshotSample = {
    total: 0,
    sample: {}
}

results.forEach(result => {
    if (result && result.links.length > 0) {
        snapshotSample.total += result.links.length;
        snapshotSample.sample[result.lang] = result.links;
    }
});

const outputDir = path.join(__dirname, '../output/');
fs.writeFileSync(path.join(outputDir, 'snapshotSample.json'), JSON.stringify(snapshotSample), (err) => {
    if (err) throw err;
});

console.log(snapshotSample.total);
