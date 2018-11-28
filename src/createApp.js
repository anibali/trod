import express from 'express';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import yaml from 'js-yaml';


// TODO: Do this properly
const experimentDir = 'experiment';
const traceNames = ['step', 'time', 'epoch', 'loss'];
const traces = {};
traceNames.forEach(traceName => {
  const steps = [];
  const values = [];
  const filePath = path.join(experimentDir, 'traces', traceName, 'trace.tsv');
  const lineReader = readline.createInterface({ input: fs.createReadStream(filePath) });
  lineReader.on('line', line => {
    const [step, value] = line.split('\t');
    steps.push(parseInt(step, 10));
    values.push(JSON.parse(value));
  });
  traces[traceName] = { steps, values };
});

const manifest = yaml.safeLoad(fs.readFileSync(path.join(experimentDir, 'manifest.yml')));
const views = manifest.views.map((view, i) => Object.assign({}, view, { id: i + 1 }));

const renderHtmlPage = (title, assetManifest) => (`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${title}</title>
      <link rel="stylesheet" type="text/css" href="${assetManifest['app.css']}">
    </head>
    <body>
      <div id="root"></div>
      <script src="${assetManifest['app.js']}"></script>
      <script>main()</script>
    </body>
  </html>
`);

export default () => Promise.resolve()
  .then(() => express())
  .then(app => {
    const distDir = path.resolve(__dirname, '..', 'dist');
    app.use('/assets', express.static(distDir));
    app.get('/', (req, res) => {
      const title = 'Trod';
      const assetManifest = JSON.parse(
        fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));
      const htmlContent = renderHtmlPage(title, assetManifest);
      res.send(htmlContent);
    });
    app.get('/traces/:traceName', (req, res) => {
      res.json(traces[req.params.traceName]);
    });
    app.get('/views', (req, res) => {
      res.json(views);
    });
    return app;
  });
