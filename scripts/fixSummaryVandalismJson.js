const fs = require("fs");

const array = fs.readFileSync("./output/es-summary-vandalism.json").toString().split("\n");



array.forEach((line) => {
    const lineObject = JSON.parse(line);
    const newSummaryUrl = lineObject.summaryUrl.replace(/(.*summary\/)(.*)$/, function(total, a, b) { 
        return `${a}${encodeURI(b)}`
    })
    lineObject.summaryUrl = newSummaryUrl
    fs.appendFileSync("./output/fixed-es-summary-vandalism.json", JSON.stringify(lineObject) + "\r\n")
})