const { sample } = require('underscore');

module.exports = class WikiPageSample {
    constructor(options) {
        this.pages = options.data || []
        this.sampleSize = options.sampleSize || this.pages.length
    }

    getWikiPages() {
        return this.pages
    }

    getSample() {
        return sample(this.getWikiPages(), this.sampleSize);
    }
}
