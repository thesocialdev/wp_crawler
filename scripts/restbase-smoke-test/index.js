const Benchmark = require('../../lib/benchmark/index');
const WikiPageSample = require('../../lib/benchmark/sample');
const sampleArray = require("./fixtures/enwiki-sample.json");

const options = {
    sample: {
        data: sampleArray,
    },
    benchmark: {
        servers: [
            {
                label: 'Restbase',
                project: 'wikipedia',
                params: {},
                headers: {} // a custom header can be passed to every request
            },
            {
                label: 'API Gateway',
                project: 'wikipedia',
            },
        ],
    }
}

let sample = new WikiPageSample(options.sample);
let benchmark = new Benchmark(sample, options.benchmark);

benchmark.exec("en").then(() => {});
