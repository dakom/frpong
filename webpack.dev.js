const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');

const extend = target => {
    const extended = Object.assign({}, target, {
        mode: "development",
        devtool: "inline-source-map",
    });
    if(process.env["NODE_ENV"] === "dev-auto-reload") {
        extended.module.rules.push({test: path.resolve(__dirname, 'node_modules/webpack-dev-server/client'), loader: "null-loader"});
    }
    return extended;
}

const browserConfig = merge(extend(common.browserConfig), {
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

const mainWorkerConfig = extend(common.mainWorkerConfig);
const aiWorkerConfig = extend(common.aiWorkerConfig);

module.exports = [browserConfig, mainWorkerConfig, aiWorkerConfig];
