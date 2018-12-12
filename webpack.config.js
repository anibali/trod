const webpack = require('webpack');
const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AssetsManifestPlugin = require('webpack-assets-manifest');
const CleanObsoleteChunksPlugin = require('webpack-clean-obsolete-chunks');
const getLocalIdent = require('css-loader/lib/getLocalIdent');
const postcssImport = require('postcss-import');
const postcssVariables = require('postcss-css-variables');
const postcssPresetEnv = require('postcss-preset-env');


// Determine whether we are in development or production mode.
const possibleModes = ['development', 'production'];
const mode = process.env.NODE_ENV || 'development';
console.assert(possibleModes.includes(mode));

const nodeModulesPath = path.resolve(process.env.NODE_PATH || 'node_modules');

// Supported browsers (in the Browserslist config format).
const browsers = ['last 2 versions', 'ie >= 9', 'safari >= 7'];

const plugins = {
  any: [
    new webpack.DefinePlugin({
      'process.env': {
        IN_BROWSER: JSON.stringify(true),
        NODE_ENV: JSON.stringify(mode),
      },
    }),
    new MiniCssExtractPlugin({
      filename: '[name]-[chunkhash].css',
      chunkFilename: '[name]-[chunkhash].css',
    }),
    new webpack.HashedModuleIdsPlugin(),
    new AssetsManifestPlugin({
      publicPath: true,
    }),
  ],
  production: [],
  development: [
    new NodemonPlugin({
      script: 'src/serverEntry.js',
      watch: [path.resolve('src')],
    }),
    new CleanObsoleteChunksPlugin({ deep: true }),
  ],
};


module.exports = {
  mode,
  entry: {
    app: ['./src/clientEntry.js', './src/styles/main.global.css'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/assets/'
  },
  plugins: plugins.any.concat(plugins[mode]),
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve('src'),
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              sourceType: 'unambiguous',
              presets: [
                ['@babel/preset-env', {
                  modules: false,
                  useBuiltIns: 'usage',
                  targets: { browsers }
                }],
                '@babel/preset-react'
              ],
            }
          },
        ]
      },
      {
        test: /\.css$/,
        include: [
          path.resolve('src/styles'),
        ],
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]--[hash:base64:9]',
              getLocalIdent: (loaderContext, localIdentName, localName, options) => (
                loaderContext.resourcePath.endsWith('.global.css')
                  ? localName
                  : getLocalIdent(loaderContext, localIdentName, localName, options)
              )
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [postcssImport(), postcssVariables(), postcssPresetEnv({ browsers })]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        include: [
          nodeModulesPath,
        ],
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader',
        ]
      },
    ],
  },
  resolveLoader: {
    modules: [nodeModulesPath],
  },
  resolve: {
    modules: [nodeModulesPath],
  }
};
