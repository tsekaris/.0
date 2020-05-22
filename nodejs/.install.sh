#!/bin/sh

pkg install nodejs-lts -y

f(){
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  export PATH=$PATH:~/.npm-global/bin # Για να έχει συνέχεια τα installs χωρίς "source .bashrc"
  npm install -g npm
  npm set init.author.name "Tsekaris Michael"
  npm set init.author.email "tsemix@gmail.com"
  npm set init.author.url "https://github.com/tsekaris/"
  npm set init.license "MIT"
  npm set init.version "0.0.0"
}
