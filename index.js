const moment = require('moment');
const mwapi = require('./lib/mwapi');
const querystring = require('querystring');
const ObjectsToCsv = require('objects-to-csv');

const allWikis = ["aa","ab","ace","ady","af","ak","als","am","an","ang","ar","arc","arz","as","ast","atj","av","ay","az","azb","ba","bar","bat-smg","bcl","be","be-x-old","bg","bh","bi","bjn","bm","bn","bo","bpy","br","bs","bug","bxr","ca","cbk-zam","cdo","ce","ceb","ch","cho","chr","chy","ckb","co","cr","crh","cs","csb","cu","cv","cy","da","de","din","diq","dsb","dty","dv","dz","ee","el","eml","en","eo","es","et","eu","ext","fa","ff","fi","fiu-vro","fj","fo","fr","frp","frr","fur","fy","ga","gag","gan","gd","gl","glk","gn","gom","gor","got","gu","gv","ha","hak","haw","he","hi","hif","ho","hr","hsb","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","ilo","inh","io","is","it","iu","ja","jam","jbo","jv","ka","kaa","kab","kbd","kbp","kg","ki","kj","kk","kl","km","kn","ko","koi","kr","krc","ks","ksh","ku","kv","kw","ky","la","lad","lb","lbe","lez","lfn","lg","li","lij","lmo","ln","lo","lrc","lt","ltg","lv","mai","map-bms","mdf","mg","mh","mhr","mi","min","mk","ml","mn","mo","mr","mrj","ms","mt","mus","mwl","my","myv","mzn","na","nah","nap","nds","nds-nl","ne","new","ng","nl","nn","no","nov","nrm","nso","nv","ny","oc","olo","om","or","os","pa","pag","pam","pap","pcd","pdc","pfl","pi","pih","pl","pms","pnb","pnt","ps","pt","qu","rm","rmy","rn","ro","roa-rup","roa-tara","ru","rue","rw","sa","sah","sat","sc","scn","sco","sd","se","sg","sh","shn","si","simple","sk","sl","sm","sn","so","sq","sr","srn","ss","st","stq","su","sv","sw","szl","ta","tcy","te","tet","tg","th","ti","tk","tl","tn","to","tpi","tr","ts","tt","tum","tw","ty","tyv","udm","ug","uk","ur","uz","ve","vec","vep","vi","vls","vo","wa","war","wo","wuu","xal","xh","xmf","yi","yo","yue","za","zea","zh","zh-classical","zh-min-nan","zh-yue","zu"]
// const allWikis = ["en"];
let totalMapframe = 0;

// TODO: save profiled errors into file
let profile = {
    errors: {
        getLanguageAggPages: [],
        getPageViews: [],
    }
}
/**
 * Get pages by project and language
 */
const getLanguageAggPages = async (lang, project, params) => {
    let wikiPages = [],
        data,
        url;
    try {
        let total = 0;
        do{
            url = lang.length === 0 ? `https://${project}/w/api.php?${querystring.stringify(params)}` : `https://${lang}.${project}/w/api.php?${querystring.stringify(params)}`;
            const res = await mwapi.get(url);
                data = res.data;
            if (typeof data.query !== 'undefined') {
                // append pages array with result
                wikiPages = [ ...wikiPages, ...data.query.search ];
                // accumulate total number of pages
                if (data.query.searchinfo) {
                    total += data.query.searchinfo && data.query.searchinfo.totalhits || 0;
                } else {
                    total += data.query.search && data.query.search.length || 0;
                }
                if (typeof res.data.continue != 'undefined') {
                    params.sroffset = res.data.continue.sroffset;
                }
            }
        } while (typeof data.continue !== 'undefined' && typeof data.query !== 'undefined')
        return {
            pages: { lang, project, wikiPages },
            total: total,
        };
    } catch (err) {
        profile.errors.getLanguageAggPages.push({
            url,
            message: "Error: getLanguageAggPages " + err,
            err,
        });
      // console.info('url', url);
      // console.info("Error: getLanguageAggPages " + err.message);
    }
}

/**
 * get page views from each page
 * @param  {[type]} lang    [description]
 * @param  {[type]} project [description]
 * @param  {[type]} page    [description]
 * @return {[type]}         [description]
 */
const getPageViews = async (lang, project, page) => {
    // from last month
    const startDate = moment().subtract(30, 'days').format('YYYYMMDDHH');
    const endDate = moment().format('YYYYMMDDHH');
    const projectUrl = lang.length === 0 ? `${project}` : `${lang}.${project}`;
    let totalPageViews, dailyAverage;
    let url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${projectUrl}/all-access/user/${encodeURIComponent(page)}/daily/${startDate}/${endDate}`;
    try {
        const res = await mwapi.get(url);
        const data = res.data;
        // Get total pageviews and daily average per page
        const totalPageViews = res.data.items.reduce((acc, item) => {
            return acc + parseInt(item.views);
        }, 0)
        if (res.data.items.length != 0){
            dailyAverage = totalPageViews / res.data.items.length;
        }
        return {
            dailyAverage,
            totalPageViews,
        };
    } catch (err) {
        profile.errors.getPageViews.push({
            url,
            message: "Error: getPageViews " + err,
            err,
        });
      // console.info('url', url);
      // console.info("Error: getPageViews " + err.message);
    }
}

const mwapiReqLanguage = async (project, languages, callback) => {
    let result = {
            pages: [],
            total: 0,
        };

    // Define parameters and use srsearch to find insource:mapframe calls
    const params = {
        action: 'query',
        format: 'json',
        formatversion: 2,
        list: 'search',
        srsearch: 'insource:mapframe',
        srlimit: 500,
        srnamespace: 0,
        srinfo: '',
        srprop: '',
    }
    let promises = languages.map(async (lang, index) => {
            return await callback(lang, project, params).then((searchResult) => {
                // Remove undefined searchResult, maybe due a mismatch
                // between project and lang or no page found
                if (typeof searchResult !== 'undefined') {
                    result.pages.push(searchResult.pages);
                    result.total = result.total + searchResult.total;
                }
            });
        });

    return Promise.all(promises).then(() => { return result });
};

const metricsToCSV = (wikisArray, langArray) => {
    // for each project, get total mapframe aggregating all languages
    wikisArray.forEach((wiki) => {
        mwapiReqLanguage(wiki, langArray, getLanguageAggPages).then(async (result) => {
            // for each page get pageviews and aggregate values
            let promises = await result.pages.map(async projectPages => {
                let promises = await projectPages.wikiPages.map(async (page) => {
                    return await getPageViews(projectPages.lang, projectPages.project, page.title.replace(/ /g, '_'));
                });
                totalPageViews = await Promise.all(promises);
                let dailyAverage = 0,
                    pageCount = 0;
                totalPageViews = totalPageViews.filter(value => {
                    return typeof value !== 'undefined'
                }).reduce((acc, value) => {
                    pageCount++;
                    dailyAverage += value.dailyAverage;
                    return acc + value.totalPageViews
                }, 0);
                // create object with metrics to save into pageviews
                return {
                    lang: projectPages.lang,
                    project: projectPages.project,
                    pageCount,
                    totalPageViews,
                    dailyAverage,
                }
            });
            let pageViews = await Promise.all(promises);
            let csv = new ObjectsToCsv(pageViews);

            // Save to file:
            await csv.toDisk(`./csv/${wiki}.csv`);
        });
    })
}

// get metrics into CSV for wikis with language subdomain
const wikis = ['wikipedia.org', 'wikivoyage.org', 'wikibooks.org', 'wikiquote.org', 'wikiversity.org'];
metricsToCSV(wikis, allWikis)

// get metrics into CSV for wikis without language subdomain
const noLangWikis = ['www.mediawiki.org', 'species.wikimedia.org', 'www.wikidata.org'];
metricsToCSV(noLangWikis, [''])