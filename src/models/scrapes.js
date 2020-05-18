function getScrape(client, url, callback) {
    // TODO: Rewrite to use promises vs callback

    try {
        client.query('SELECT * FROM crawls where raw_url = $1', [url], function (err, result) {
            if(err) {
                console.log(err);
                callback(null, err);

                return;
            }

            callback(result.rows);
        });
    } catch(e) {
        console.log(e);
        callback(null, e);
    }
}

// TODO: Add addScrape

module.exports = {
    'getScrape': getScrape
};