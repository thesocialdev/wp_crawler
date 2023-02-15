const normalizeTitle = (title) => {
    return title.replace(/ /g, "_")
}

exports.default = {
    normalizeTitle
}