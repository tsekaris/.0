# Installation σε εξωτερικό σκληρό.

Η εγκατάσταση γίνεται για τον t5 σε εικονική μηχανή.

Οι εξωτερικοί ssd δεν συμπεριφέρονται όπως τα στικάκια.
Όταν τρέχω το arch iso και κάνω connect τον σκληρό δεν τον αναγνωρίζει όπως κάνει στο στικάκι.
Πρέπει να δηλώσω στην εικονική μηχανή σκληρό δίσκο ως φυσικό.
Αυτό είναι πολύ επικίνδυνο αν κάνω mount κάποιον σκληρό δίσκο του συστήματος.
Βοηθάει η αρίθμιση στο utility των windows που κάνουν format και διαχείριση των σκληρών.
Έχω πρόσβαση στο λειτουργικό του σκληρού από την εικονική μηχανή.
Ικανοποιήθηκε ένα ζητούμενο και πρέπει να ελεγχθεί αν λειτουργούν και τα snapshots.
Όταν έτρεξε για πρώτη φορά σε φυσικό pc έβγαλε μήνυμα σφάλματος ότι δεν μπορεί να βρει την συσκευή με UUID.
Αν στο grub, μπω στην δεύτερη επιλογή (failback initramfs) τότε μπαίνω στο λειτουργικό.
Μέσα στο λειτουργικό αν τρέξω:

sudo pacman -S linux 

φεύγει το σφάλμα.

Λειτούργησε σωστά στο lenovo, mini και στο acer.
Στον acer δημιουργήθηκε ένα θέμα με την ονομασία της wifi κάρτας το οποίο λύθηκε μέσω του network manager.
Όταν το ξαναέβαλα στο lenovo έκανα μία αστοχία με την wifi κάρτα και την έσβησα. Δεν μπόρεσα να την επαναφέρω αλλά δεν νομίζω να είναι θέμα εγκατάστασης.

# To do.

## Partitioning.

Κάποια σφάλματα όταν ήδη υπάρχει partition στο usb.
Δεν δημιουργείτε θέμα στην εγκατάσταση.

## Time.

* Υπάρχει νέα εντολή για ορισμό της τοπικής ώρας από systemd.
* Αλλάζει η ώρα του συστήματος σε utc και πάει δύο ώρες πίσω στα windows 10.

## Vim.

Η πρώτη εγκατάσταση των plugins δημιουργεί θέμα και σταματάει την διαδικασία.
Αν πατηθεί enter συνεχίζεται κανονικά η διαδικασία αλλά είναι ενοχλητικό.

Λύση:
Απενεργοποίηση από τον installer η εγκατάσταση των plugins.
Η εγκατάσταση των plugins, όταν θα ανοίξει πρώτη φορά των vims.

## Bash scripts.
Πρέπει να γίνει μία νέα οργάνωση.
Κοινή λογική σε termux και arch.
Να δούμε τι θα γίνει με το fish.
Πρέπει να ενταχθεί και η pc funtion.

## Εμφάνιση.
* Τα χρώματα του bash terminal είναι άχρωμα.
* Εμφάνιση volume στο i3status.
* Εμφάνιση γλώσσας.

## Ξεκαθάρισμα.

Φιλτράρισμα του archOld και delete.
