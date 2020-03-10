#!/bin/sh

touch index.js
npm init --yes # This will trigger automatically populated initialization.dd
npm i -D eslint prettier eslint-plugin-prettier eslint-config-prettier
npx install-peerdeps --dev eslint-config-airbnb-base #Στην ουσία install eslint-config-airbnb-base (χωρίς react) eslint-plugin-import

