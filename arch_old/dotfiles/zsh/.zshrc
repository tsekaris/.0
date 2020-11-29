# If not running interactively, don't do anything
[[ $- != *i* ]] && return

# zsh modules
autoload -Uz promptinit compinit
promptinit
compinit 

# Prompt
prompt off
#PROMPT=$'%F{yellow}%~\n'
PROMPT='%~ ' 

# History
REPORTTIME=3 # Report command running time if it is more than 3 seconds
HISTFILE=~/.zhistory
HISTSIZE=1000
SAVEHIST=1000
setopt INC_APPEND_HISTORY # Add commands to history as they are entered, don't wait for shell to exit
setopt EXTENDED_HISTORY # Also remember command start time and duration
setopt HIST_IGNORE_ALL_DUPS # Do not keep duplicate commands in history
setopt HIST_IGNORE_SPACE # Do not remember commands that start with a whitespace
setopt SHARE_HISTORY # Save history entries as soon as they are entered
setopt CORRECT_ALL # Correct spelling of all arguments in the command line
setopt COMPLETE_ALIASES # For autocompletion of command line switches for aliases
#unsetopt MENU_COMPLETE # on tab completion
setopt AUTO_CD # cd by typing directory name if it's not a command
#setopt AUTO_LIST # Automatically list choices on ambiguous completion
#setopt AUTO_MENU # Automatically use menu completion
#setopt ALWAYS_TO_END # move cursor to end if word had one match

zstyle ':completion:*' menu select # Enable autocompletion
setopt MENU_COMPLETE # auto complete


source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh/plugins/zsh-history-substring-search/zsh-history-substring-search.zsh
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# alias
. ~/.alias

# start x server
if [[ "$(tty)" == '/dev/tty1' ]]; then
    exec startx
fi

