#!/bin/bash
file="./output/es-vandalism.json"
n=$(cat ./output/es-vandalism.json | wc -l)
last_index_dir="./last_index"

[[ -f $last_index_dir ]] && last_index=$(<$last_index_dir) || last_index="1"
for ((i = $last_index + 1 ; i <= $n ; i++)); do
    cat $file | sed -n "${i}p" | jq -r .mobileHtmlUrl
    cat $file | sed -n "${i}p" | jq -r .mobileHtmlUrl | xargs curl --fail -sSL -H 'Cache-Control: no-cache' -o /dev/null || exit 1
    echo $i > $last_index_dir
    # sleep 0.1 # throttle the requests as suited
done
