const fetch = require("node-fetch");
const fs = require("fs");
const https = require("https");
const http = require("http");
require("dotenv").config();
const cors = require("cors");

const express = require("express");
const app = express();
const port = 80;

app.use(cors());

const saved = {};

const cache = (req, res, next) => {
    let key = req.params.query;
    let data = saved[key];
    if (data) {
        console.log("Response was saved");
        res.send(JSON.parse(data));
        return;
    } else {
        console.log("Response not saved");
        res.sendResponse = res.send;
        res.send = (body) => {
            saved[key] = body;
            res.sendResponse(body);
        };
    }
    next();
};

app.get("/:query", cache, async (req, res) => {
    try {
        const year = req.params.query.match(/[0-9]{4}/g)[0];
        const key = req.params.query.replace(/[0-9]{4}/g, "");
        const data = await send(key);
        const filtered = data.products.filter((x) => x.vintage == year);
        if (filtered.length != 0) {
            res.send(filtered);
        } else {
            res.send(data.products[0]);
        }
    } catch (e) {
        console.log("This is what went wrong");
        console.error(e);
        res.send(null);
    }
});

const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/342sdfsdfkk.tk/privkey.pem",
    "utf8"
);
const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/342sdfsdfkk.tk/cert.pem",
    "utf8"
);
const ca = fs.readFileSync(
    "/etc/letsencrypt/live/342sdfsdfkk.tk/chain.pem",
    "utf8"
);

const creds = { key: privateKey, cert: certificate, ca: ca };

const httpServer = http.createServer(app);
const httpsServer = https.createServer(creds, app);

httpServer.listen(80, () => {});
httpsServer.listen(443, () => {});

function send(query) {
    return new Promise((resolve, reject) => {
        fetch(
            encodeURI(
                "https://api-extern.systembolaget.se/sb-api-ecommerce/v1/productsearch/search?size=30&page=1&textQuery=" +
                    query +
                    "&isEcoFriendlyPackage=false&isInDepotStockForFastDelivery=false"
            ),
            {
                headers: {
                    accept: "application/json, text/plain, */*",
                    "accept-language": "en-US,en;q=0.9",
                    "ocp-apim-subscription-key": process.env.KEY,
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "sec-gpc": "1",
                },
                referrer: "https://www.systembolaget.se/",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET",
                mode: "cors",
            }
        )
            .then((res) => res.json())
            .then((json) => resolve(json))
            .catch((err) => reject(err));
    });
}
