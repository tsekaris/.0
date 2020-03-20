#!/bin/sh
echo 
echo "rclone syncing to gdrive..."
rclone sync --progress ~/0 gdrive:0 --exclude "/engineering/**" 
echo "rclone finished. Press enter."
echo 
read pause
