var db = new PouchDB('parts');

async function parts() {
     // Δεδομένα από google sheets.
     // File -> Publish to the web
     // Δεν χρειάζεται shared.
    let id = '13_HE3uL66MY-mu_dwQHKcY6Hyq2k5lRdVmTIFXt02GA';
    let sheet = 1;
    try {
        let response = await fetch(`https://spreadsheets.google.com/feeds/cells/${id}/${sheet}/public/full?alt=json`);
        let googleData = await response.json();
        let data = [];
        let dataTotals = {};
        googleData.feed.entry.forEach(item=>{
            let groupData = JSON.parse(item.content.$t)
            dataTotals[groupData[0].type] = groupData.length;
            data = [...data, ...groupData];
        }
        );
        // Για να γλιτώσω την cache.
        // Διαφορετικά δεν σβήνεται η βάση δεδομένων με την ανανέωση του chrome.
        await db.destroy(); 
        db = new PouchDB('parts');
        // Εισαγωγή docs
        let docsResult = await db.bulkDocs(data);
        let docsOk = [];
        let docsNoOk = [];
        docsResult.forEach((item)=>{
            if (item.ok) {
                docsOk.push(item);
            } else {
                docsNoOk.push(item);
            }
        }
        );
        //Δημιουργία index.
        let indexResult = await db.createIndex({
            index: {
                fields: ['brand', 'type', 'p', 'a.max'],
                name: 'abb',
                ddoc: 'indexes'
            }
        });
        return {data, dataTotals, docsNoOk, docsOk, indexResult};
    } catch (err) {
        console.log(err);
    }
}

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
        let result = await db.find({
            selector: query,
            fields: ['_id'],
            use_index: ['indexes', 'abb'],
        });
        console.log(result);
        return result;
    } catch (err) {
        console.log(err);
    }
}

parts().then(console.log)