const fetch = require("node-fetch");
require("dotenv").config();

const express = require("express");
const app = express();
const port = 3000;

app.get("/:query", async (req, res) => {
    try {
        const data = await send(req.params.query);
        res.send(data.products[0]);
    } catch (e) {
        console.log("This is what went wrong");
        console.error(e);
        res.send(null);
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

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
