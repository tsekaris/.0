#!/bin/bash

path=$(dirname $(realpath -s $0))

#termux-setup-storage # Για να βλέπω τους φακέλους του κινητού
#ln -s $HOME/storage/shared/0 $HOME/0 # Συντόμευση του 0 στο home
[ ! -d $HOME/.termux ] && ln -s $path/.home/.termux $HOME/.termux # dotfolder
