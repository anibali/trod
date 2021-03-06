const webpack = require('webpack');
const path = require('path');
const process = require('process');
const stringArgv = require('string-argv').default;
const NodemonPlugin = require('nodemon-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AssetsManifestPlugin = require('webpack-assets-manifest');
const CleanObsoleteChunksPlugin = require('webpack-clean-obsolete-chunks');
const postcssImport = require('postcss-import');
const postcssVariables = require('postcss-css-variables');
const postcssPresetEnv = require('postcss-preset-env');


// Determine whether we are in development or production mode.
const possibleModes = ['development', 'production'];
const mode = process.env.NODE_ENV || 'development';
console.assert(possibleModes.includes(mode));

const nodeModulesPath = path.resolve(process.env.NODE_PATH || 'node_modules');

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
      args: stringArgv(process.env.TROD_ARGS),
      watch: [path.resolve('src')],
    }),
    new CleanObsoleteChunksPlugin({ deep: true }),
  ],
};


const cssPipeline = ({ modules }) => [
  { loader: MiniCssExtractPlugin.loader },
  {
    loader: 'css-loader',
    options: {
      modules,
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      plugins: [postcssImport(), postcssVariables(), postcssPresetEnv()]
    }
  }
];


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
                  corejs: '2',
                  useBuiltIns: 'usage',
                }],
                '@babel/preset-react'
              ],
            }
          },
        ]
      },
      {
        // Required for Plotly to work correctly.
        test: /\.js$/,
        loader: 'ify-loader',
        exclude: [path.resolve('src')],
      },
      {
        test: /\.global.css$/,
        include: [
          path.resolve('src/styles'),
        ],
        use: cssPipeline({ modules: false }),
      },
      {
        test: /^((?!\.global).)*css$/,
        include: [
          path.resolve('src/styles'),
        ],
        use: cssPipeline({ modules: 'local' }),
      },
      {
        test: /\.css$/,
        include: [
          nodeModulesPath,
        ],
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: {
              modules: false,
            }
          },
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
