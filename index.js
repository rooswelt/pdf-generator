const express = require('express')
const puppeteer = require('puppeteer')
const createEngine = require('node-twig').createEngine;
const renderFile = require('node-twig').renderFile;
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

const app = express();

app.engine('.twig', createEngine({
    root: __dirname + '/templates',
}));
app.set('views', './templates');
app.set('view engine', 'twig');
app.use(bodyParser.json());

app.post('/export/html', (req, res) => {
    const templateName = req.body.templateName || 'test.twig';
    const data = req.body || {};
    console.log(data);
    res.render(templateName, {
        context: {
            data: data,
        }
    });
})

app.post('/export/pdf', (req, res) => {
    (async () => {
        try {
            const templateName = req.body.templateName || 'test.twig';
            const data = req.body || {};
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            const html = await renderHTML(templateName, {
                context: {
                    data: data,
                }
            });
            await page.setContent(html);
            const buffer = await page.pdf({
                format: 'A4'
            })
            res.type('application/pdf')
            res.send(buffer)
            browser.close()
        } catch (error) {
            res.status(500).send(new Error(JSON.stringify(error)));
        }

    })()
})

app.listen(port, () => {
    console.log(`PDF Generator listening at port ${port}`)
})

function renderHTML(templateName, options) {
    return new Promise((resolve, reject) => {
        renderFile(__dirname + '/templates/' + templateName, options, function (error, template) {
            if (error) {
                reject(error);
            } else {
                resolve(template);
            }
        });
    });
}