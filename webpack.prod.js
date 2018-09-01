const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    plugins: [
       
          new UglifyJSPlugin({
              sourceMap: true
          }),
          
    ]
});
