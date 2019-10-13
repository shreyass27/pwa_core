
var dbPromise = idb.open('posts-store', 1, function (db) {
    // checks if posts object store is already created 
    if (!db.objectStoreNames.contains('posts')) {
        // Creates new object store 
        db.createObjectStore('posts', {
            keyPath: 'id'
        });
    }
});

function writeData(storeName, data) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(storeName, 'readwrite');
            var store = tx.objectStore(storeName);
            store.put(data);
            return tx.complete;
        });
}

function readAllData(storeName) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(storeName, 'readonly');
            var store = tx.objectStore(storeName);
            return store.getAll();
        });
}

function clearAllData(storeName) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(storeName, 'readwrite');
            var store = tx.objectStore(storeName);
            store.clear();
            return tx.complete;
        });
}

function deleteData(storeName, id) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(storeName, 'readwrite');
            var store = tx.objectStore(storeName);
            store.delete(id);
            return tx.complete;
        });
}