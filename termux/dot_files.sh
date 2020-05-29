#!/bin/bash

path=$(dirname $(realpath -s $0))

ln -sfn $path/.home/.termux $HOME/.termux # dotfolder
