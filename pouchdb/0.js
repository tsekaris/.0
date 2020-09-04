var db = new PouchDB('db');
var dbServer = new PouchDB('http://192.168.1.4:3000/parts');

db.sync(dbServer, {
    live: true,
}).on('change', function(change) {
    console.log(change);
}).on('error', function(err) {
    console.log(err);
});

let a = 14;

querry = {
    selector: {
        type: 'mcb',
        p: '1p',
        ch: 'B',
        kA: 10,
        aMin: {
            $gte: a
        }
    },
    fields: ['_id'],
    limit: 1
}


db.find(querry).then(console.log);

