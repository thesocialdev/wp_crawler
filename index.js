const https = require('https');
const domino = require('domino');


const baseUrl = 'https://{lang}.{project}.org/w/index.php?';
const query = 'search=insource%3Amapframe&title=Special%3ASearch&profile=advanced&fulltext=1&advancedSearch-current=%7B%22namespaces%22%3A%5B0%5D%7D&ns0=1';
const allWikis = ["aa","ab","ace","ady","af","ak","als","am","an","ang","ar","arc","arz","as","ast","atj","av","ay","az","azb","ba","bar","bat-smg","bcl","be","be-x-old","bg","bh","bi","bjn","bm","bn","bo","bpy","br","bs","bug","bxr","ca","cbk-zam","cdo","ce","ceb","ch","cho","chr","chy","ckb","co","cr","crh","cs","csb","cu","cv","cy","da","de","din","diq","dsb","dty","dv","dz","ee","el","eml","en","eo","es","et","eu","ext","fa","ff","fi","fiu-vro","fj","fo","fr","frp","frr","fur","fy","ga","gag","gan","gd","gl","glk","gn","gom","gor","got","gu","gv","ha","hak","haw","he","hi","hif","ho","hr","hsb","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","ilo","inh","io","is","it","iu","ja","jam","jbo","jv","ka","kaa","kab","kbd","kbp","kg","ki","kj","kk","kl","km","kn","ko","koi","kr","krc","ks","ksh","ku","kv","kw","ky","la","lad","lb","lbe","lez","lfn","lg","li","lij","lmo","ln","lo","lrc","lt","ltg","lv","mai","map-bms","mdf","mg","mh","mhr","mi","min","mk","ml","mn","mo","mr","mrj","ms","mt","mus","mwl","my","myv","mzn","na","nah","nap","nds","nds-nl","ne","new","ng","nl","nn","no","nov","nrm","nso","nv","ny","oc","olo","om","or","os","pa","pag","pam","pap","pcd","pdc","pfl","pi","pih","pl","pms","pnb","pnt","ps","pt","qu","rm","rmy","rn","ro","roa-rup","roa-tara","ru","rue","rw","sa","sah","sat","sc","scn","sco","sd","se","sg","sh","shn","si","simple","sk","sl","sm","sn","so","sq","sr","srn","ss","st","stq","su","sv","sw","szl","ta","tcy","te","tet","tg","th","ti","tk","tl","tn","to","tpi","tr","ts","tt","tum","tw","ty","tyv","udm","ug","uk","ur","uz","ve","vec","vep","vi","vls","vo","wa","war","wo","wuu","xal","xh","xmf","yi","yo","yue","za","zea","zh","zh-classical","zh-min-nan","zh-yue","zu"]
// const allWikis = ["en"];
let totalMapframe = 0;


const getTotalMapframe = (url) => {
    return new Promise((resolve) => {
        https.get(url + query, (res) =>{
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            })

            res.on('end', () => {
                let doc = domino.createDocument(data);
                let result = doc.querySelectorAll('.results-info')[0];
                if (result){
                    return resolve(parseInt(result.getAttribute('data-mw-num-results-total')));
                } else {
                    return resolve(0);
                }
            })
        }).on("error", (err) => {
          console.log("Error: " + err.message);
        });
    })
}

const getAllMapframe = async (project, languages) => {
    let acc = 0,
        url;
    let promises = languages.map(async (lang, index) => {
            if (lang) {
                url = baseUrl.replace(/{lang}/, lang);
                url = url.replace(/{project}/, project);
            } else {
                url = baseUrl.replace(/{lang}.{project}/, project);
            }
            return await getTotalMapframe(url).then((total) => {
                acc = acc + total;
            });
        });

    return Promise.all(promises).then(() => { return acc });
};

// getAllMapframe("wikiquote", allWikis).then((result) => {
//     console.log("wikiquote", result);
// });

getAllMapframe("www.mediawiki", ['']).then((result) => {
    console.log("www.mediawiki", result);
});

getAllMapframe("species.wikimedia", ['']).then((result) => {
    console.log("species.wikimedia", result);
});

getAllMapframe("www.wikidata", ['']).then((result) => {
    console.log("www.wikidata", result);
});