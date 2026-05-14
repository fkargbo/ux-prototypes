/* eslint-disable @typescript-eslint/no-var-requires */

import path from 'path';
import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import { stylePaths } from './stylePaths.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

export default merge(common('production'), {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { mergeLonghand: false }],
        },
      }),
    ],
  },
  plugins: [
    /** Bakes `EXP_LAB_FEEDBACK_SCRIPT_URL` from the build environment (e.g. GitHub Actions vars) into the client bundle. */
    new webpack.EnvironmentPlugin({
      EXP_LAB_FEEDBACK_SCRIPT_URL: '',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].bundle.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          ...stylePaths,
          path.resolve('./node_modules/@patternfly/chatbot'),
        ],
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
});
