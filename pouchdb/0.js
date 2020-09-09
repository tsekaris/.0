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
        fields: ['brand', 'type', 'p', 'a'], // Ισως να μπει και ch
        name: 'abb',
        ddoc: 'indexes'
    }
})


let abb = {
    mcb: function({p=3, ch='C', kA=10, a=0, n=0.8}) {
        db.find({
            selector: {
                brand: 'abb',
                type: 'mcb',
                p,
                a: {
                    $gte: a / n
                },
                ch,
                kA,

            },
            fields: ['_id'],
            //use_index: ['indexes', 'abb'],
            limit: 1, //Θα διαλέξει με τα μικρότερα a λόγω του _id
        }).then(console.log).catch(console.log);
    },
    cb: function({p=3, ch='mch', kA=36, a=0, n=0.8}) {
        db.find({
            selector: {
                brand: 'abb',
                type: 'cb',
                p,
                a: {
                    $gte: a / n
                },
                ch,
                kA,
            },
            fields: ['_id'],
            //use_index: ['indexes', 'abb'],
            limit: 1, //Θα διαλέξει με τα μικρότερα a λόγω του _id
        }).then(console.log).catch(console.log);
    },
    mpcb: function({a=0}) {
        db.find({
            selector: {
                brand: 'abb',
                type: 'mpcb',
                p: 3,
                a: {
                    $gte: a
                },
                aMin: {
                    $lte: a
                },

            },
            fields: ['_id'],
            //use_index: ['indexes', 'abb'],
            //limit: 1, //Θα διαλέξει με τα μικρότερα a λόγω του _id
        }).then(console.log).catch(console.log);
    },
    rly: function({type='rly', p=3, a=0, n=0.8}) {
        db.find({
            selector: {
                brand: 'abb',
                type, //Γιατί υπάρχει και rly_rail
                p,
                a: {
                    $gte: a / n
                },
            },
            fields: ['_id'],
            //use_index: ['indexes', 'abb'],
            limit: 1, //Θα διαλέξει με τα μικρότερα a λόγω του _id
        }).then(console.log).catch(console.log);
    },

}

abb.mcb({
    p: 1,
    ch: 'B',
    a: 24
});

abb.rly({
    a: 36
});
