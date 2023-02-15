#!/bin/bash
file="./output/es-vandalism.json"
n=$(cat ./output/es-vandalism.json | wc -l)
last_index_dir="./last_index"
vandalizedList="./summary-vandalized"

[[ -f $last_index_dir ]] && last_index=$(<$last_index_dir) || last_index="1"
for ((i = $last_index + 1 ; i <= $n ; i++)); do
    title=$(cat $file | sed -n "${i}p" | jq -r .title)
    echo $title
    hasGun=$(curl -sSL -G "$(perl -MURI::Escape -e 'print uri_escape shift, , q{^A-Za-z0-9\-._~/:}' -- "https://es.wikipedia.org/api/rest_v1/page/summary/$title")" | jq -r .thumbnail.source | grep gun)
    if [ -n "$hasGun" ]; then
        echo $hasGun
        echo $title >> $vandalizedList
    fi
    
    # cat $file | sed -n "${i}p" | jq -r .mobileHtmlUrl | xargs curl --fail -sSL -H 'Cache-Control: no-cache' -o /dev/null || exit 1
    echo $i > $last_index_dir
    # sleep 0.1 # throttle the requests as suited
done
