#!/bin/sh

pkg install nodejs-lts -y

mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=$PATH:~/.npm-global/bin # Για να έχει συνέχεια τα installs χωρίς "source .bashrc"
npm install -g npm

# Defaults για npm init
npm set init.author.name "tsekaris"
npm set init.author.email "tsemix@gmail.com"
npm set init.author.url "https://github.com/tsekaris/"
npm set init.license "MIT"
npm set init.version "0.0.0"

# Το .0 είναι node project
cd $HOME/.0
npm install
