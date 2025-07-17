const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const CopyPlugin = require("copy-webpack-plugin");

const client = {
  target: "web",
  entry: path.resolve(__dirname, "src", "client", "index.tsx"),
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: ["...", path.resolve(__dirname, "node_modules")],
  },
  output: {
    filename: "assets/client.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "server", "views", "layout.html"),
      filename: "views/layout.html",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "server", "views"),
          to: path.resolve(__dirname, "dist", "views"),
        },
      ],
    }),
  ],
};
const server = {
  target: "node",
  mode: "development",
  entry: path.resolve(__dirname, "src", "index.ts"),
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node-modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
    modules: ["...", path.resolve(__dirname, "node_modules")],
  },
  externalsPresets: {
    node: true,
  },
  externals: [nodeExternals()],
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "dist"),
  },
};

module.exports = [client, server];
