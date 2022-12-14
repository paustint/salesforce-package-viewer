/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { EnvironmentPlugin } = require('webpack');

module.exports = {
  entry: {
    backgroundPage: path.join(__dirname, 'src/backgroundPage.ts'),
    popup: path.join(__dirname, 'src/popup/index.tsx'),
  },
  output: {
    path: path.join(__dirname, 'dist/js'),
    filename: '[name].js',
    environment: {
      arrowFunction: true,
      bigIntLiteral: true,
      const: true,
      destructuring: true,
      dynamicImport: true,
      forOf: true,
      module: true,
      optionalChaining: true,
      templateLiteral: true,
    },
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      // Treat src/css/app.css as a global stylesheet
      {
        test: /\app.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      // Load .module.css files as CSS modules
      {
        test: /\.module.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new EnvironmentPlugin({
      API_VERSION: '55.0',
      CLIENT_ID: '3MVG9p1Q1BCe9GmDxw.U9y3e.da7uyWT3Ia4YYpsguCOcDZoJ6joTxtU42NIAwTeFK6mAw8l41JvFBuKfAhiO',
    }),
  ],
  // Setup @src path resolution for TypeScript files
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@src': path.resolve(__dirname, 'src/'),
    },
  },
};
