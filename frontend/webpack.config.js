const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/app.ts',
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    devServer: {
        static: '.dist',
        compress: false,
        port: 9000
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: 'templates', to: 'templates'},
                {from: 'styles', to: 'styles'},
                {from: 'static/fonts', to: 'static/fonts'},
                {from: 'static/images', to: 'static/images'},
                {from: 'src/lib', to: 'scripts/lib'},
                {from: 'src/addons', to: 'scripts/addons'},
            ]
        })
    ]
}