var db = new PouchDB('db');
var dbServer = new PouchDB('http://192.168.1.4:3000/parts');

db.sync(dbServer, {
    live: true,
}).on('change', function(change) {
    console.log(change);
}).on('error', function(err) {
    console.log(err);
});
