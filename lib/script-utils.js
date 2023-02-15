const run = (callback) => new Promise(async (resolve, reject) => {
    console.info("[INFO] Script started")
    try {
        const result = await callback()
        resolve(result)
    } catch (e) {
        reject(e)
    }
}).then(() => {
    console.info("[INFO] Script finished")
})

exports.default = {
    run
}