#!/bin/sh

pkg upgrade
vim +PluginInstall +qall
echo 'Press enter to continue'
read dummy
#tmux a -t upgrade || tmux new -s upgrade "pkg upgrade;vim +PluginInstall +qall;echo 'Press enter to continue';read dummy"
