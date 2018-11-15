const webpack = require('webpack');
const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AssetsManifestPlugin = require('webpack-assets-manifest');
const CleanObsoleteChunksPlugin = require('webpack-clean-obsolete-chunks');


const nodeEnv = process.env.NODE_ENV || 'development';
const nodeModulesPath = process.env.NODE_PATH || 'node_modules';

const plugins = {
  any: [
    new webpack.DefinePlugin({
      'process.env': {
        IN_BROWSER: JSON.stringify(true),
        NODE_ENV: JSON.stringify(nodeEnv),
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
      script: 'src/server.js',
      watch: [path.resolve('src')],
    }),
    new CleanObsoleteChunksPlugin({ deep: true }),
  ],
  test: []
};

module.exports = {
  entry: {
    app: ['./src/client.js', './src/styles/main.css'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/assets/'
  },
  plugins: plugins.any.concat(plugins[nodeEnv] || []),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                ['@babel/preset-env', {
                  modules: false,
                  useBuiltIns: 'usage',
                  targets: {
                    browsers: ['last 2 versions', 'ie >= 9', 'safari >= 7']
                  }
                }],
                '@babel/preset-react'
              ],
            }
          },
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader', options: { modules: true, localIdentName: '[local]--[hash:base64:9]' } },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('postcss-import')(),
                require('postcss-css-variables')(),
                require('postcss-preset-env')({ browsers: ['last 2 versions', 'ie >= 9', 'safari >= 7'] }),
              ]
            }
          }
        ]
      },
      {
        test: /node_modules\/.*\.css$/,
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
