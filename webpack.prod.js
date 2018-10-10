const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

//common settings on all configurations
const extend = target => {
    const extended = Object.assign({}, target, {
        mode: "production",
        //devtool: "source-map",
        optimization: {
            minimizer: [new TerserPlugin({
                parallel: true,
                //sourceMap: true
            })]
        }
    });

    return extended;
}

//separate configurations
const browserConfig = extend(common.browserConfig);
const mainWorkerConfig = extend(common.mainWorkerConfig);
const aiWorkerConfig = extend(common.aiWorkerConfig);


module.exports = [browserConfig, mainWorkerConfig, aiWorkerConfig];
