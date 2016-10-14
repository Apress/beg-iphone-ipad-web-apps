var globalDB = window.openDatabase("Apress", "1.0", "Apress Storage Demo", 1 * 1024 * 1024);

function checkDatabase(db) {
    /* Transaction created */
    db.transaction(
        function(tran) {
            tran.executeSql("SELECT 1 FROM News LIMIT 1");
        },

        /* Failed? The database should not be initialized */
        function() {
            initDatabase(db);
        },

        /* Success? The database is already initialized */
        function() {
            /* Start database jobs */
            refresh(db);
        }
    );
}

function initDatabase(db) {
    db.transaction(function(transaction) {
        createSchema(transaction, initFeedList);
    }, null, function() {
        refresh(db);
    });
}

function createSchema(tran, next) {
    var schema = [
        "CREATE TABLE Source (" +
        "    SourceID     INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
        "    Name         VARCHAR(100) NOT NULL," +
        "    URL          VARCHAR(100) NOT NULL," +
        "    LastUpdated  DATETIME NULL" +
        ")",
    
        "CREATE TABLE News (" +
        "    NewsID     INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
        "    SourceID   INTEGER NOT NULL," +
        "    GUID       CHAR(32)," +
        "    Title      VARCHAR(200) NOT NULL," +
        "    Content    TEXT NOT NULL," +
        "    Date       DATETIME NOT NULL," +
        "    TargetURL  VARCHAR(100) NOT NULL," +
        "    FOREIGN KEY (SourceID) REFERENCES Source(SourceID)" +
        ")"
    ];

    executeSequence(tran, schema, null, next);
}

function executeSequence(tran, list, params, next) {
    params  = params || [];
    var max = Math.max(list.length, params.length);
    var i   = -1;

    (function recursive(tran) {
        if (++i < max) {
            tran.executeSql(list[i % list.length], params[i], recursive);

        /* Sequence completed */
        } else if (next) {
            next(tran);
        }
    })(tran);
}

function initFeedList(tran) {
    var sql  = ["INSERT INTO Source (Name, URL) VALUES(?, ?)"];

    var data = [
        ["New York Times", "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml"],
        ["Financial Times", "http://www.ft.com/rss/world/us"]
    ];

    executeSequence(tran, sql, data);
}

function refresh(db) {
    /* Always display the previous content */
    processFeed(db);

    /* Then try to refresh the News table */
    db.transaction(function (tran) {
        tran.executeSql("SELECT SourceID, URL, LastUpdated FROM Source", null,
            function(tran, res) {
                for (var i = 0; i < res.rows.length; i++) {
                    var row  = res.rows.item(i);
                    var last = row.LastUpdated || new Date(0);
                    var ttl  = new Date() - 1000 * 60 * 10;	// 10 minutes
                    /* If the feed needs update */
                    if (last <= ttl) {
                        loadFeed(row.URL, db, row.SourceID);
                    }
                }
            }
        );
    });
}

function loadFeed(url, db, id) {
    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function() {
        feedLoaded(this, db, id);
    }
    xml.open("get", "proxy.php?url=" + encodeURIComponent(url));
    xml.send();
}

function feedLoaded(xhr, db, id) {
    if (xhr.readyState == xhr.DONE && xhr.status == 200) {
        updateFeed(xhr.responseXML, db, id);
    }
}

function updateFeed(xml, db, id) {
    db.transaction(function (tran) {
        tran.executeSql("UPDATE Source SET LastUpdated = ? WHERE SourceID = ?",
            [new Date(), id]);

        var all = xml.getElementsByTagName("item");
        for (var i = 0; i < all.length; i++) {
            var params = [];

            params.push(getText(all[i], "title"));
            params.push(getText(all[i], "description"));
            params.push(new Date(getText(all[i], "pubDate")));
            params.push(getText(all[i], "link"));
            params.push(id);
            params.push(getText(all[i], "guid"));

            upsertNews(tran, params);
        }
    }, null, function() {
        processFeed(db);
    });
}

function upsertNews(tran, params) {
    var len  = params.length;
    var guid = params[len - 1];
    var id   = params[len - 2];

    tran.executeSql(
        "SELECT NewsID FROM News WHERE SourceID = ? AND GUID = ?", [id, guid],

        function(tran, res) {
            var sql = (res.rows.length == 0) ?
                "INSERT INTO News (Title, Content, Date, TargetURL, SourceID, GUID) " +
                "    VALUES(?, ?, ?, ?, ?, ?)"
            :
                "UPDATE News SET " +
                "    Title = ?, Content = ?, Date = ?, TargetURL = ? " + 
                "WHERE SourceID = ? AND GUID = ?";
            tran.executeSql(sql, params);
        }
    );
}

