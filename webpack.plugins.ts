import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: "webpack-infrastructure",
  }),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(
          __dirname,
          "node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.mjs"
        ),
        to: path.resolve(__dirname, ".webpack/pdf.worker.mjs"),
      },
    ],
  }),
];
