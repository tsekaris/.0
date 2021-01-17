cat test.txt | tr -s "|" "\t"| fzf --header-lines=2 --with-nth .. -d '\t'|tr -s "\t" "|"
