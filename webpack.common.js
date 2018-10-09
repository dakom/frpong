const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isProduction = process.env['NODE_ENV'] === "production" ? true : false;


const commonConfig = {
    module: {
        rules: [
            {
                //enforce: "pre",
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader", 
                        options: { transpileOnly: true }
                    },
                    "source-map-loader"
                ]
            },
            {
                test: /\.wasm$/,
                type: "webassembly/experimental",
            },
            { test: /\.html$/, loader: "html-loader" },
            { test: /\.scss$/,loaders: ["style-loader", "css-loader","fast-sass-loader"] },
            { test: /\.(glsl|vs|fs)$/, loader: 'ts-shader-loader'},
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".wasm"],
        alias: {
            "io": path.resolve(__dirname, "src/io/"),
            "purescript": path.resolve(__dirname, "output/"),
            "game": path.resolve(__dirname, "src/game/")
        }
    },
}

const browserConfig = Object.assign({}, commonConfig, {
    entry: {
        io: path.resolve('./src/Main-App.ts'),
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js",
        sourceMapFilename: "[name].bundle.map",
        publicPath: '',
        globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },

    plugins: [

        new CleanWebpackPlugin(['dist']),

        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './site/index.html'),
            hash: true,
        }),

        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env['NODE_ENV']),
                'BROADCAST': JSON.stringify(process.env['BROADCAST']),
                'BUILD_VERSION': JSON.stringify(require("./package.json").version)
            }
        }),
        new ForkTsCheckerWebpackPlugin()
    ],
});


const mainWorkerConfig = Object.assign({}, commonConfig, {
    target: 'webworker',
    entry: path.resolve('./src/Main-Worker.ts'),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "mainWorker.js",
        //globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env['NODE_ENV']),
                'BROADCAST': JSON.stringify(process.env['BROADCAST']),
                'BUILD_VERSION': JSON.stringify(require("./package.json").version)
            }
        }),
        new ForkTsCheckerWebpackPlugin()
    ],
});

const aiWorkerConfig = Object.assign({}, commonConfig, {
    target: 'webworker',
    entry: path.resolve('./src/Ai-Worker.ts'),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "aiWorker.js",
        //globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env['NODE_ENV']),
                'BROADCAST': JSON.stringify(process.env['BROADCAST']),
                'BUILD_VERSION': JSON.stringify(require("./package.json").version)
            }
        }),
        new ForkTsCheckerWebpackPlugin()
    ],
});
module.exports = {browserConfig, mainWorkerConfig, aiWorkerConfig}

