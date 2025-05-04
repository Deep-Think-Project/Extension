const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    popup: "./src/popup/index.js",
    content: "./src/content/content.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/popup/popup.html",
      filename: "popup.html",
      chunks: ["popup"]
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/manifest.json", to: "." },
        { from: "icons", to: "icons" }
      ]
    })
  ],
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devtool: 'source-map',
};
