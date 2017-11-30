module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "env": {
    "node": true,
  },
  "rules": {
    "strict": "off",
    "no-await-in-loop": "off",
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "no-unused-expressions": ['error', { "allowTernary": true }]
  },
};
