var webpack = require('webpack')
var path = require('path');

module.exports = {
    mode: "production", /* production */
    devServer: {
        port: 9000,
        static: "./src",
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080',
            },
        }
    },
    entry: './src/entry.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/, // 要排除
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        "presets": [
                            ["@babel/preset-env", { modules: false }]
                        ],
                        "plugins": [
                            "@babel/plugin-transform-runtime",
                            "@babel/plugin-transform-regenerator"
                        ],
                    }
                }
            }
        ]
    },
    plugins: [new webpack.BannerPlugin('作者: 530308418@qq.com')]
}