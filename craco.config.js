const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript', 'html', 'css', 'json'],
          features: ['!gotoSymbol']
        })
      ]
    }
  }
};