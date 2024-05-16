const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',  // 開発中は 'development'、本番環境では 'production' を使う
  entry: './src/index.ts',  // エントリーポイント（TypeScriptファイル）
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,  // .css拡張子を対象とする
        use: ['style-loader', 'css-loader']
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],  // 解決するファイルの拡張子
  },
  output: {
    filename: 'bundle.js',  // 出力ファイル名
    path: path.resolve(__dirname, 'dist'),  // 出力ディレクトリ
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html' // srcディレクトリ内のindex.htmlをテンプレートとして使用
    })
  ],
};
