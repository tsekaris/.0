var dbServer = new PouchDB('http://192.168.1.4:3000/parts');
var db = new PouchDB('db');
db.destroy().then(function() {
    db = new PouchDB('db');
    db.sync(dbServer, {
        live: true,
    }).on('change', function(change) {
        console.log(change);
    }).on('error', function(err) {
        console.log(err);
    });
    

})

async function abb(query={}) {
    try {
        let createIndex = await db.createIndex({
            index: {
                fields: ['brand', 'type', 'p', 'a'],
                name: 'abb',
                ddoc: 'indexes'
            }
        });
        if (createIndex.result === 'created' || createIndex.result === 'exists') {
            console.log(createIndex);
            query.brand = 'abb';
            if (query.type === undefined) {
                query.type = {
                    $gt: null
                }
            }

            if (query.p === undefined) {
                query.p = {
                    $gt: null
                }
            }

            //απαραίτητο αν δεν ορίσω καμία μια μεταβλητή από το index. Με null δεν λειτουργεί
            if (query.a === undefined) {
                query.a = {
                    $gt: 0
                }
            }

            let result = await db.find({
                selector: query,
                fields: ['_id'],
                use_index: ['indexes', 'abb'],
            });
            console.log(result);
            return result;
        }
    } catch (err) {
        console.log(err);
    }
}
