module.exports = {
  "roots": [
    "<rootDir>/src/content-script"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "preset": "jest-puppeteer"
}
