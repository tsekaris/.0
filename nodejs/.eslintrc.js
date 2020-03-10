module.exports = {
//    "env": {
//        "browser": true,
//        "es6": true,
//        "node": true,
//    },
    "plugins": ["prettier"],
    "extends": [
        "airbnb-base",
        "prettier",
    ],
    "rules": {
      //"no-console": "off",
      "prettier/prettier": "error",
    },
/*
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
    },
    "parserOptions": {
        "ecmaVersion": 2018,
    }
*/
};
