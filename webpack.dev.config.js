const path = require('path')

module.exports = {
    entry: './build/app.dev.js',
    target: 'node',
    mode: "development",
    output: {
        filename: 'octra-api.js',
        path: path.resolve(__dirname, 'dist')
    }
}
