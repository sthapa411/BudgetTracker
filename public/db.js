window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

if (!window.indexedDB) {
    console.log("IndexedDB is not supported in your browser!")
} else {console.log("IndexedDB is supported by your browser.")
    
     //create new request for 'budget' database
    let db
    const request = indexedDB.open("budget",1);

    request.onupgradeneeded = event => {
        console.log(event);
        const db = event.target.result;
        // create an object store
        db.createObjectStore("pending", {autoIncrement:true});
        console.log("created db with auto incrementing")
    };

    request.onsuccess = event => {
        db = event.target.result;

        if (navigator.onLine) {
            checkDatabase();
            console.log("We're online!")
        }
    };

    request.onerror = event => {
        console.log("Whoops! " + event.target.errorCode)
    }

    // save record function
    function saveRecord(record) {
        const transaction = db.transaction(["pending"], "readwrite");
        // access pending object store
        const store = transaction.objectStore("pending");
        // add a record to store 
        store.add(record);
    }

    function checkDatabase() {
        console.log("Checking Database")
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        // get all records from store, set to a variable
        const getAll = store.getAll();
        
        getAll.onsuccess = () => {
 
            if (getAll.result.length > 0) {
                fetch("/api/transaction/bulk", {
                  method: "POST",
                  body: JSON.stringify(getAll.result),
                  headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
                })
                .then(response => response.json())
                .then(() => {
                  // if successful, open a transaction on your pending db
                  // access your pending object store
                  // clear all items in your store
                  const transaction = db.transaction(["pending"], "readwrite");
                  const store = transaction.objectStore("pending");
                  store.clear();
                });
              }
            };
        }
    }

    // if device is back online, sync with database;
    window.addEventListener("online",checkDatabase);