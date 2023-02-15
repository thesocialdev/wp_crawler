const request = require('request');

const throttledRequest = require('throttled-request')(request);
const throttleConfig = {
    requests: 15,
    milliseconds: 500
};
throttledRequest.configure(throttleConfig);

const querySearch = ({lang, project}, params) => {
    const uri = `https://${lang}.${project}.org/w/api.php`
    return new Promise((resolve) => {
        throttledRequest({ method: "GET", uri, qs: params }, function(err, res){
            // console.log("Requesting: " + url)
            if (err) {
                console.error(err);
                return {};
            }
            try {
                resolve(res && res.body && JSON.parse(res.body));
            } catch (e) {
                console.error(e);
                console.log(uri, res.body);
                resolve(undefined);
            }
        });
    });
}

const search = async ({ lang, project }, params, acc = []) => {
    const body = await querySearch({lang, project}, params);
    // const body = JSON.parse(res.body);
    const { query } = body
    const loadMore = body.continue;
    const { searchinfo } = query;
    if (
        searchinfo &&
        searchinfo.totalhits &&
        searchinfo.totalhits > 0 &&
        !(loadMore && loadMore.continue)
    ) {
        console.info(`${searchinfo.totalhits} totalhits for language ${lang}`);
    }

    const titles = query.search.map((wikipage) => {
        return wikipage.title;
    });

    acc = [
        ...acc,
        ...titles
    ];

    if (loadMore && loadMore.continue) {
        const { sroffset } = loadMore;
        return search(lang, Object.assign(params, { sroffset }), acc);
    }

    return acc;
}

exports.default = {
    search,
    querySearch
}