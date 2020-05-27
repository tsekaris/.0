#!/bin/sh

#termux-setup-storage # Για να βλέπω τους φακέλους του κινητού
#ln -s $HOME/storage/shared/0 $HOME/0 # Συντόμευση του 0 στο home
[ ! -d $HOME/.termux ] && ln -s $HOME/.0/termux/.termux $HOME/.termux # dotfolder
[ ! -d $HOME/.termux ] && mkdir $HOME/.0/.tmp
