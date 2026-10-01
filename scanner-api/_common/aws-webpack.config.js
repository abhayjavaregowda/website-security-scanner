const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    carbon: './scanner-api/carbon.js',
    cookies: './scanner-api/cookies.js',
    'dns-server': './scanner-api/dns-server.js',
    dns: './scanner-api/dns.js',
    dnssec: './scanner-api/dnssec.js',
    'get-ip': './scanner-api/get-ip.js',
    headers: './scanner-api/headers.js',
    hsts: './scanner-api/hsts.js',
    'linked-pages': './scanner-api/linked-pages.js',
    'mail-config': './scanner-api/mail-config.js',
    ports: './scanner-api/ports.js',
    quality: './scanner-api/quality.js',
    redirects: './scanner-api/redirects.js',
    'robots-txt': './scanner-api/robots-txt.js',
    screenshot: './scanner-api/screenshot.js',
    'security-txt': './scanner-api/security-txt.js',
    sitemap: './scanner-api/sitemap.js',
    'social-tags': './scanner-api/social-tags.js',
    ssl: './scanner-api/ssl.js',
    status: './scanner-api/status.js',
    'tech-stack': './scanner-api/tech-stack.js',
    'trace-route': './scanner-api/trace-route.js',
    'txt-records': './scanner-api/txt-records.js',
    whois: './scanner-api/whois.js',
  },
  externals: [nodeExternals()],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack'),
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
};
