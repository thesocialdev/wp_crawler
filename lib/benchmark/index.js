const Report = require('./report')
const { performance } = require('perf_hooks');
const { getMobileHtmlPage } = require('../html').default
const { detailedDiff } = require('deep-object-diff')

function moduleIsAvailable (path) {
    try {
        require.resolve(path);
        return true;
    } catch (e) {
        return false;
    }
}

const path = '../output/results.json';
const previousResults = moduleIsAvailable(path) ? require(path) : {};
module.exports = class Benchmark {
    constructor(sample, options) {
        this.sample = sample;
        this.options = options;
        this.totalSample = this.sample.getWikiPages().length;
        this.executionCounter = 0;
        this.results = Object.assign(
            {
                diffpages: {},
                sampleSize: 0,
                executionPerf: []
            },
            previousResults
        );
        this.report = new Report();
    }

    async getData(page, lang) {
        return {
            req1: await this.doRequest({
                ...this.options.servers[0],
                title: page,
                lang
            }),
            req2: await this.doRequest({
                ...this.options.servers[1],
                title: page,
                lang
            }),
        }
    }

    async doRequest(options) {
        const mobileHtmlPage = await getMobileHtmlPage(options)
        // console.log(mobileHtmlPage.headers)
        return mobileHtmlPage
    }

    async checkDiff(page, lang) {
        const { req1, req2 } = await this.getData(page, lang) // Request pages and their content
        console.log(detailedDiff(req1.headers, req2.headers))
        // TODO: do diff for header and content separately
        this.printProgress();
    }


    printProgress(acc, total){
        this.executionCounter+=1
        const progress = (this.executionCounter / this.totalSample) * 100
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Running: ${progress}% (${this.executionCounter}/${this.totalSample})`);
    }

    async exec(lang = null) {
        this.executionCounter = 0;
        console.time();
        this.timeStart = performance.now();
        const sample = this.sample;

        return Promise.all(sample.getSample().map((page) => {
            return this.checkDiff(page, lang)
        })).then(() => {
            process.stdout.write('\n');
            this.timeEnd = performance.now();
            this.results.executionPerf.push({
                timeEnd: this.timeEnd,
                timeStart: this.timeStart,
                lang
            })
            this.report.saveFinalReport(this.results);
        })
    }
}
