/* eslint-disable @typescript-eslint/no-var-requires */

import fs from 'fs';
import path from 'path';
import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import { stylePaths } from './stylePaths.js';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '3000';

/**
 * Serve ExP-Lab `feedback-layer.js` from the submodule build.
 * Do not add root `dist/` here — after `npm run build`, stale production assets can
 * shadow webpack-dev-server's in-memory bundles (broken images, wrong hashes).
 */
const expLabDistPath = path.resolve('./exp-lab/dist');
const devStaticDirectories = [];
if (fs.existsSync(expLabDistPath)) {
  devStaticDirectories.push({
    directory: expLabDistPath,
    publicPath: '/',
    watch: true,
  });
}

export default merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    host: HOST,
    port: PORT,
    historyApiFallback: true,
    open: true,
    static: devStaticDirectories,
    client: {
      overlay: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          ...stylePaths,
          path.resolve('./node_modules/@patternfly/chatbot'),
        ],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
