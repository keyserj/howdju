import type { Config } from "jest";

/**
 * Our monorepo's base Jest config.
 *
 * Packages use this by importing it and merging any custom config.
 *
 * Note that `${__dirname}` will refer to the location of the package's jest.config, so we must use
 * `__dirname` below to reference files from the workspace root.
 */

const config: Config = {
  testRegex: ".*\\.test\\.[tj]sx?$",
  setupFiles: [`${__dirname}/jest/setup.js`],
  setupFilesAfterEnv: [
    "jest-extended/all",
    `${__dirname}/jest/setupAfterEnv.ts`,
  ],
  transformIgnorePatterns: [
    // Include some extra stuff under node_modules in our babel transform
    // What we add here should probably go into Babel's ignore pattern too (to be unignored).
    "node_modules/(?!(@grrr/cookie-consent|@grrr/utils|nanoid|jsdom|strip-indent|normalize-url|text-fragments-polyfill|approx-string-match|is-absolute-url))",
  ],
  transform: {
    // This custom transform does:
    // 1. Adds .mjs so that babel transform's the @grrr packages.
    // 2. Uses a babel-jest rooted in the workspace root so that it transforms TypeScript files
    //    under the `jest` subdirectory.
    "^.+\\.(mj|t|j)sx?$": `${__dirname}/babel-jest`,
  },
  reporters: [
    `${__dirname}/jest/OutputConsoleOnFailureOnlyReporter.js`,
    `${__dirname}/node_modules/@jest/reporters/build/SummaryReporter.js`,
  ],
  resolver: `${__dirname}/jest/resolver.js`,
  // TODO potentially add this (currently used by howdju-mobile-app.)
  // setupFiles: [`${__dirname}/jest/react-navigation-setup.ts`],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|md)$": `${__dirname}/jest/__mocks__/fileMock.js`,
    "\\.(scss|css|less)$": "identity-obj-proxy",
  },
  coverageReporters: [
    ["html-spa", { subdir: "html" }],
    "json",
    "text",
    "text-summary",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
  ],
};

export default config;
