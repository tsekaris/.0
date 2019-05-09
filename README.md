# Εγκατάσταση.

## Από φάκελο κινητού.

```
termux-setup-storage
pkg install nnn
```
Υπάρχει ο φάκελος termux στο κινητό. Με το nnn βρίσκουμε το system/install.sh και το εκτελούμε.

## Από git.

```
pkg install git
git clone https://github.com/tsekaris/termux ~/.0
sh ~/.0/scripts/system/install.sh
```
## Με μία εντολή.

```
pkg install curl #wget δεν λειτουργεί με https
curl -O https://raw.githubusercontent.com/tsekaris/termux/master/scripts/system/clone_install.sh | bash
```
