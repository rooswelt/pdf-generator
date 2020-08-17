const express = require("express");
const puppeteer = require("puppeteer");
const createEngine = require("node-twig").createEngine;
const renderFile = require("node-twig").renderFile;
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;

const app = express();

app.engine(
    ".twig",
    createEngine({
        root: __dirname + "/templates"
    })
);
app.set("views", "./templates");
app.set("view engine", "twig");
app.use(bodyParser.json({
    limit: '500mb'
}));

app.get("/export/html", (req, res) => {
    (async () => {
        try {
            const templateName = req.body.templateName || "test.twig";
            const data = req.body.data || {};
            const html = await renderHTML(templateName, {
                context: {
                    data: data
                }
            });

            res.send(html);
        } catch (error) {
            res.status(500).send(new Error(JSON.stringify(error)));
        }
    })();
});

app.get("/export/pdf", (req, res) => {
    (async () => {
        try {
            const templateName = req.body.templateName || "test.twig";
            const data = req.body.data || {};
            const html = await renderHTML(templateName, {
                context: {
                    data: data
                }
            });
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.emulateMedia('screen'); //Needed to print colors
            await page.setContent(html);

            const buffer = await page.pdf({
                format: "A4",
                printBackground: true,
            });
            res.type("application/pdf");
            res.send(buffer);
            await page.close();
            browser.close();
        } catch (error) {
            console.log('Error', error);
            res.status(500).send(new Error(JSON.stringify(error)));
        }
    })();
});

app.listen(port, () => {
    console.log(`PDF Generator listening at port ${port}`);
});

function renderHTML(templateName, options) {
    return new Promise((resolve, reject) => {
        renderFile(__dirname + "/templates/" + templateName, options, function (
            error,
            template
        ) {
            if (error) {
                reject(error);
            } else {
                resolve(template);
            }
        });
    });
}
