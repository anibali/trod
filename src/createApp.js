import express from 'express';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import crypto from 'crypto';
import csv from 'csv-streamify';
import base32 from 'base32';


const calcHash = str => base32.encode(crypto.createHash('md5').update(str).digest().slice(0, 8));

// Load all experiments from the experiment root directory.
const loadExperiments = async (rootDir) => {
  const experimentDirs = fs.readdirSync(rootDir)
    .map(entry => path.resolve(rootDir, entry))
    .filter(fullPath => fs.statSync(fullPath).isDirectory());

  const manifestsByExperiment = {};

  experimentDirs.forEach(experimentDir => {
    const experimentId = path.basename(experimentDir);
    const yamlText = fs.readFileSync(path.join(experimentDir, 'manifest.yml'));
    manifestsByExperiment[experimentId] = yaml.safeLoad(yamlText);
  });

  const simpleTracesById = {};
  const traceDataById = {};

  const readTraceData = traceDataId => new Promise((resolve, reject) => {
    const steps = [];
    const values = [];
    const parser = csv({ delimiter: '\t' });
    parser.on('data', ([step, value]) => {
      steps.push(parseInt(step, 10));
      values.push(JSON.parse(value));
    });
    parser.on('end', () => resolve({ id: traceDataId, steps, values }));
    parser.on('error', reject);
    const { filePath } = traceDataById[traceDataId];
    fs.createReadStream(filePath).pipe(parser);
  });

  Object.entries(manifestsByExperiment).forEach(([experimentId, manifest]) => {
    manifest.traces.simple.forEach(trace => {
      const traceDataId = calcHash(`${experimentId}/${trace.data}`);
      traceDataById[traceDataId] = {
        id: traceDataId,
        filePath: path.join(rootDir, experimentId, trace.data),
      };
      const traceId = calcHash(`${experimentId}/${trace.name}`);
      simpleTracesById[traceId] = {
        id: traceId,
        experiment: experimentId,
        name: trace.name,
        traceData: traceDataId,
      };
    });
  });

  return { simpleTracesById, readTraceData, manifestsByExperiment };
};

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


export default async (rootDir) => {
  const { simpleTracesById, readTraceData, manifestsByExperiment } = await loadExperiments(rootDir);

  const app = express();

  const distDir = path.resolve(__dirname, '..', 'dist');
  app.use('/assets', express.static(distDir));

  app.get('/', (req, res) => {
    const title = 'Trod';
    const assetManifest = JSON.parse(
      fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));
    const htmlContent = renderHtmlPage(title, assetManifest);
    res.send(htmlContent);
  });

  app.get('/experiments', (req, res) => {
    res.json(Object.keys(manifestsByExperiment).map(id => ({ id })));
  });

  app.get('/experiments/:experimentId/traces', (req, res) => {
    const traces = Object.values(simpleTracesById)
      .filter(trace => trace.experiment === req.params.experimentId);
    res.json(traces);
  });

  app.get('/experiments/:experimentId/views', (req, res) => {
    const manifest = manifestsByExperiment[req.params.experimentId];
    const views = manifest.views.map(view => ({
      id: calcHash(`${req.params.experimentId}/${view.name}`),
      experiment: req.params.experimentId,
      ...view,
    }));
    res.json(views);
  });

  app.get('/tracedata/:traceDataId', (req, res) => {
    readTraceData(req.params.traceDataId).then(traceData => {
      res.json(traceData);
    });
  });

  return app;
};
