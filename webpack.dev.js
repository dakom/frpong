const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');

console.log(process.env["NODE_ENV"]);

const rules = (process.env["NODE_ENV"] === "dev-auto-reload")
    ? []
    : [{test: path.resolve(__dirname, 'node_modules/webpack-dev-server/client'), loader: "null-loader"}]

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    module: {
        rules: rules.concat([
            {
                test: /\.rs$/,
                use: [{
                    loader: 'wasm-loader'
                }, {
                    loader: 'rust-native-wasm-loader',
                    options: {
                        release: false,
                        gc: true
                    }
                }]
            }
        ])
    },
    devServer: {
        //contentBase: path.join(__dirname, "dist/"),
        contentBase: path.resolve(__dirname, './src/webpage'),
        compress: true,
        port: 3000,
        headers: { "Access-Control-Allow-Origin": "*" },
        historyApiFallback: {
            disableDotRule: true
        }
    },
    plugins: [
        
    ]
});
