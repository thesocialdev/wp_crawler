#!/bin/bash

# Parse fb2w.nt file into a json with structure
# {
#   "Q192056":"m.03mvzj",
#   "Q192056":"m.03mvzj"
# }
cat fb2w.nt | \
    sed "s/^<.\+freebase.\+\/.\+\/\(.\+\)>\s<.\+w3.\+\/.\+\/.\+>\s<.\+wikidata.\+\/.\+\/\(.\+\)> \.\$/\"\2\":\"\1\",/g" | \
    # Remove comments in the first lines
    sed -e "1,4d" | \
    sed -e "$d" | \
    # remove comma from last line
    sed -e "$ s/,//" | \
    # add array wrappers and finish json
    sed "1 i\{" | \
    sed -e "$ a\}" > mapping.json



