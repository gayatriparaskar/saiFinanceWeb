const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          exclude: [/\.map$/, /manifest$/, /\.htaccess$/]
        }),
      ],
    },
  },
};
