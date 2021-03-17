const path = require('path')

module.exports = {
    entry: './build/app.prod.js',
    target: 'node',
    mode: "production",
    output: {
        filename: 'octra-api.js',
        path: path.resolve(__dirname, 'dist')
    }
}
