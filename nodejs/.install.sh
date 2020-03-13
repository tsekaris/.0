#!/bin/sh

pkg install nodejs-lts -y

f(){
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  #line="export PATH=$PATH:~/.npm-global/bin"
  #grep -Fxq "$line" ~/.bashrc || echo "$line" >> ~/.bashrc
  export PATH=$PATH:~/.npm-global/bin # Για να έχει συνέχεια τα installs χωρίς "source .bashrc"
  npm install -g npm
}

# Δεν χρειάζεται
#f
