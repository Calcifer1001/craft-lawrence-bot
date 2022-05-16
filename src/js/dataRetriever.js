const config = require("contractsConfig")

const http = require('http'),
      https = require('https');
let client = http;

function get(url) {
    if (config.ORACLE_URL.toString().indexOf("https") === 0) {
        client = https;
    }

    client.get(url, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            resolve(data);
        });

    }).on("error", (err) => {
        reject(err);
    });
}



