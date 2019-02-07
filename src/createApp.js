import express from 'express';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import crypto from 'crypto';
import csv from 'csv-streamify';
import base32 from 'base32';
import chokidar from 'chokidar';


const calcHash = str => base32.encode(crypto.createHash('md5').update(str).digest().slice(0, 8));

const isSubpath = (parent, filePath) => {
  const relative = path.relative(parent, filePath);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
};

const watchExperiments = (rootDir) => {
  const experimentsState = {
    simpleTracesById: {},
    traceDataById: {},
    manifestsByExperiment: {},
    readTraceData: function(traceDataId) {
      const steps = [];
      const values = [];
      const parser = csv({ delimiter: '\t' });
      parser.on('data', ([step, value]) => {
        steps.push(parseInt(step, 10));
        values.push(JSON.parse(value));
      });
      const promise = new Promise((resolve, reject) => {
        parser.on('end', () => resolve({ id: traceDataId, steps, values }));
        parser.on('error', reject);
      });
      const { filePath } = experimentsState.traceDataById[traceDataId];
      fs.createReadStream(filePath).pipe(parser);
      return promise;
    },
  };

  const reloadExperiments = (events) => {
    const changedExpSet = new Set(events
      .map(e => path.relative(rootDir, e.fsPath).split(path.sep)[0])
    );
    changedExpSet.delete('');
    const changedExperiments = [...changedExpSet]
      .filter(expId => fs.statSync(path.join(rootDir, expId)).isDirectory());

    const allExperiments = fs.readdirSync(rootDir)
      .map(entry => path.resolve(rootDir, entry))
      .filter(fullPath => fs.statSync(fullPath).isDirectory())
      .map(fullPath => path.basename(fullPath));

    const simpleTracesById = {};
    const traceDataById = {};
    const manifestsByExperiment = {};

    allExperiments.forEach(expId => {
      let manifest;
      if(changedExperiments.includes(expId)
          || !(expId in experimentsState.manifestsByExperiment)) {
        // Load experiment manifest
        const experimentDir = path.join(rootDir, expId);
        const yamlText = fs.readFileSync(path.join(experimentDir, 'manifest.yml'));
        manifest = yaml.safeLoad(yamlText);
      } else {
        // Copy previously loaded experiment manifest
        manifest = experimentsState.manifestsByExperiment[expId];
      }
      manifestsByExperiment[expId] = manifest;

      manifest.traces.simple.forEach(trace => {
        const traceDataId = calcHash(`${expId}/${trace.data}`);
        if(events.some(e => isSubpath(path.join(rootDir, expId, trace.data), e.fsPath))
            || !(traceDataId in experimentsState.traceDataById)) {
          traceDataById[traceDataId] = {
            id: traceDataId,
            filePath: path.join(rootDir, expId, trace.data),
          };
        } else {
          traceDataById[traceDataId] = experimentsState.traceDataById[traceDataId];
        }

        const traceId = calcHash(`${expId}/${trace.name}`);
        if(events.some(e => isSubpath(path.join(rootDir, expId, trace.name), e.fsPath))
            || !(traceId in experimentsState.simpleTracesById)) {
          simpleTracesById[traceId] = {
            id: traceId,
            experiment: expId,
            name: trace.name,
            traceData: traceDataId,
          };
        } else {
          simpleTracesById[traceId] = experimentsState.simpleTracesById[traceId];
        }
      });
    });

    experimentsState.manifestsByExperiment = manifestsByExperiment;
    experimentsState.simpleTracesById = simpleTracesById;
    experimentsState.traceDataById = traceDataById;
  };

  const events = [];
  chokidar.watch(rootDir).on('all', (event, fsPath) => {
    events.push({ event, fsPath });
  });

  const interval = 1000; // Minimum time between calls to `reloadExperiments`.
  setInterval(() => {
    if(events.length > 0) {
      reloadExperiments(events.splice(0, events.length));
    }
  }, interval);

  return experimentsState;
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
  const experimentsState = watchExperiments(rootDir);

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
    res.json(Object.keys(experimentsState.manifestsByExperiment).map(id => ({ id })));
  });

  app.get('/experiments/:experimentId/traces', (req, res) => {
    const traces = Object.values(experimentsState.simpleTracesById)
      .filter(trace => trace.experiment === req.params.experimentId);
    res.json(traces);
  });

  app.get('/experiments/:experimentId/views', (req, res) => {
    const manifest = experimentsState.manifestsByExperiment[req.params.experimentId];
    const views = manifest.views.map(view => ({
      id: calcHash(`${req.params.experimentId}/${view.name}`),
      experiment: req.params.experimentId,
      ...view,
    }));
    res.json(views);
  });

  app.get('/tracedata/:traceDataId', (req, res) => {
    experimentsState.readTraceData(req.params.traceDataId).then(traceData => {
      res.json(traceData);
    });
  });

  return app;
};
