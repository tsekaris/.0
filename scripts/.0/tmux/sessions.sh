#!/bin/sh

#tmux new-session -d -s pc "sh $(find -L ~/.0 -name "*.sh"| fzf)" # -L: και για τις συντομεύσεις
tmux ls | awk '{ gsub(":","",$1); print $1 }' | fzf
