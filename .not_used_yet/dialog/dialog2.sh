#!/bin/bash

#OUTPUT="input.txt"
#>$OUTPUT

dialog --title "Delete file" \
--backtitle "Linux Shell Script Tutorial Example" \
--menu "Are you sure you want to permanently delete /tmp/foo.txt ?" 0 0 0 1 "network" 2 "disk" 3 "gui" 2>.temp

RESPONSE=$?
#RESULT=$(<$OUTPUT)
RESULT=$(cat .temp)

echo $RESPONSE
echo $RESULT
rm .temp


#case $response in
   #0) echo "File deleted.";;
   #1) echo "File not deleted.";;
   #255) echo "[ESC] key pressed.";;
#esac
