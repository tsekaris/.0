#!/bin/bash

echo
echo
echo "Answers:"
echo No remotes found - make a new one: n
echo name> google drive
echo Type of storage to configure: 13 for google drive
echo client_id> blank
echo client_secret> blank
echo Edit advanced config? n
echo Use auto config? y εκτός και αν είναι headless σύστημα. Το termux δεν θεωρείται headless και θα ανοίξει ο browser.
echo Συνδέουμε μέσω browser το gdrive με το rclone.
echo Επιβεβαιώνουμε τον κωδικό.
echo Τέλος διαδικασίας με quit
echo
echo

rclone config
