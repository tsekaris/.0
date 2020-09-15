/*
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
*/
var db = new PouchDB('parts');

async function parts() {
    let id = '13_HE3uL66MY-mu_dwQHKcY6Hyq2k5lRdVmTIFXt02GA';
    let sheet = 1;
    try {
        let response = await fetch(`https://spreadsheets.google.com/feeds/cells/${id}/${sheet}/public/full?alt=json`);
        let googleData = await response.json();
        let data = [];
        googleData.feed.entry.forEach(item=>{
            data = [...data, ...(JSON.parse(item.content.$t))];
        });
        let result = await db.bulkDocs(data);
        return result;
    } catch (err) {
        console.log(err);
    }
}

parts().then(console.log);

async function abbIndex() {
    try {
        return await db.createIndex({
            index: {
                fields: ['brand', 'type', 'p', 'a.max'],
                name: 'abb',
                ddoc: 'indexes'
            }
        });
    } catch (err) {
        console.log(err);
    }
}

abbIndex().then(console.log);

async function abb(query={}) {
    try {
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
            query['a.max'] = {
                $gt: 0
            }
        } else {
            if (query.a.min !== undefined) {
                query['a.min'] = query.a.min;
                delete query.a.min;
            }
            if (query.a.max !== undefined) {
                query['a.max'] = query.a.max;
                delete query.a.max;
            }
        }
        console.log(query);
        let result = await db.find({
            selector: query,
            fields: ['_id'],
            use_index: ['indexes', 'abb'],
        });
        console.log(result);
        return result;
    } catch (err) {
        console.log(err);
        if (err.error === 'no_usable_index') {
            abbIndex().then(result=>{
                console.log(result);
                abb(query);
            }
            );
        }

    }
}
