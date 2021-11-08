const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  entry: {
    content: path.join(__dirname, "src/content-script/script.ts")
  },
  output: { path: path.join(__dirname, "dist/browser-plugin"), filename: "[name].js" },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["babel-preset-env"],
            plugins: [
              [
                "babel-plugin-transform-runtime",
                { polyfill: false, regenerator: true }
              ]
            ]
          }
        }
      },
      {
        test: /\.ts(x)?$/,
        loader: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  devServer: {
    contentBase: "./dist"
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: "./node_modules/webextension-polyfill/dist/", to: "." },
        {from: "./node_modules/tippy.js/dist/tippy.css", to: "./assets/tippy.css"},
        {from: "./node_modules/tippy.js/themes/light-border.css", to: "./assets/tippy-light-border.css"},
        {from: "./node_modules/tippy.js/animations/shift-away.css", to: "./assets/tippy-shift-away.css"}
      ]
    })
  ]
};

module.exports = config;
