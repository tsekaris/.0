var db = new PouchDB('db');
var dbServer = new PouchDB('http://192.168.1.4:3000/parts');

db.sync(dbServer, {
    live: true,
}).on('change', function(change) {
    console.log(change);
}).on('error', function(err) {
    console.log(err);
});

db.createIndex({
    index: {
        fields: ['brand', 'type', 'p', 'ch', 'kA', 'a'],
        name: 'abb',
        ddoc: 'tsekIndexes'
    }
})

let abb = {
    mcb: function({p='1p', ch='C', kA=10, a=0, n=0.8}) {
        db.find({
            selector: {
                brand: 'abb',
                type: 'mcb',
                p,
                ch,
                kA,
                a: {
                    $gte: a / n
                },
            },
            fields: ['_id'],
            use_index: ['tsekIndexes', 'abb'],
            limit: 1,
        }).then(console.log).catch(console.log);
    }
}

abb.mcb({
    p: "1p",
    ch: 'B',
    a: 24
});
