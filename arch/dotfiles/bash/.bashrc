#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

if [[ "$(tty)" == '/dev/tty1' ]]; then
    exec startx
fi
