
var dbName = "sjDB";

var DBCONN = null;

function migrateDB() {


    
    sklad.open(dbName, {
        version: 1,
        migration: {
            '1': function (database) {
                // This migration part starts when your code runs first time in the browser.
                // This is a migration from "didn't exist" to "1" database version
                var objStore = database.createObjectStore('user');
            },
        }
    }, function (err, conn) {
        // work with database connection
        console.log("CONNECTED TO DB: ", conn, err);
    });
}

function deleteDB() {
    sklad.deleteDatabase( dbName, function( err, conn) {
        if (err) {
            console.log("couldn't delete DB: ", dbName);
        } else {
            console.log("success? ", err, conn)
        }
    })
    
}