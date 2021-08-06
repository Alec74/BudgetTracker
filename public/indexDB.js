let db;

const request = indexedDB.open('budgetTracker', 1);

request.onupgradeneeded = function (e) {
    console.log('upgrade');

    db = e.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('BudgetTrackerStore', { autoIncrement: true });
    }
};

request.onsuccess = function (e) {
    console.log('success');

    db = e.target.result;

    if (navigator.online) {
        console.log('online');
        checkDatabase();
    };
};

request.onerror = function (e) {
    console.log(e.target.errorCode)
};

const saveRecord = (record) => {
    console.log('save');

    const transaction = db.transaction(['BudgetTrackerStore'], 'readwrite');

    const store = transaction.objectStore('BudgetTrackerStore');

    store.add(record);
};

function checkDatabase() {
    console.log('checking');

    let transaction = db.transaction(['BudgetTrackerStore'], 'readwrite');

    const store = transaction.objectStore('BudgetTrackerStore');

    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                }
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.length !== 0) {
                        transaction = db.transaction(['BudgetTrackerStore'], 'readwrite');

                        const currentStore = transaction.objectStore('BudgetTrackerStore');

                        currentStore.clear();
                        console.log('cleared store');
                    };
                });
        };
    };
};

window.addEventListener('online', checkDatabase);