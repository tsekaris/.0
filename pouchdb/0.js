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

//let link = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIltzx-zQxBvDdgkBaP8Jbl62hUheFKy0NnkswMyG4Pl1HFxJfr1LXD3uRitr06OqucT5_TG34Yqfr/pub?output=tsv';
//let link = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIltzx-zQxBvDdgkBaP8Jbl62hUheFKy0NnkswMyG4Pl1HFxJfr1LXD3uRitr06OqucT5_TG34Yqfr/pub?output=csv';
//let link = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIltzx-zQxBvDdgkBaP8Jbl62hUheFKy0NnkswMyG4Pl1HFxJfr1LXD3uRitr06OqucT5_TG34Yqfr/pubhtml';


/*
fetch(link, {
    mode: 'no-cors'
}).then(response => response.text()).then(data => console.log(data));

*/
async function getFile(link){
    let response = await fetch(link, {mode: 'no-cors'});
    let text = await response.text();
    return text;
}


//getFile(link).then(console.log).catch(console.log);

async function abbIndex() {
    try {
        return await db.createIndex({
            index: {
                fields: ['brand', 'type', 'p', 'a'],
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
