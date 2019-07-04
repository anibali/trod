import express from 'express';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import crypto from 'crypto';
import base32 from 'base32';
import chokidar from 'chokidar';
import { Transform } from 'stream';


const calcHash = str => base32.encode(crypto.createHash('md5').update(str).digest().slice(0, 8));

const isSubpath = (parent, filePath) => {
  const relative = path.relative(parent, filePath);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
};

const isDirectory = filePath => fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();

class TraceDataParser extends Transform {
  constructor() {
    super({ objectMode: true });
    this.buffer = Buffer.alloc(4 * 1024 * 1024);
    this.buffer2 = Buffer.alloc(4 * 1024 * 1024);
    this.bufLen = 0;
    this.key = null;
  }

  _transform(chunk, encoding, callback) {
    const newChunk = this.buffer2.slice(0, this.bufLen + chunk.length);
    this.buffer.copy(newChunk, 0, 0, this.bufLen);
    chunk.copy(newChunk, this.bufLen);
    chunk = newChunk;
    let chunkPos = 0;
    while(true) {
      if(this.key == null) {
        // Parse key (step).
        const tabIndex = chunk.indexOf('\t', chunkPos);
        if(tabIndex < 0) {
          break;
        }
        this.key = parseInt(chunk.slice(chunkPos, tabIndex).toString(encoding), 10);
        chunkPos = tabIndex + 1;
      } else {
        // Parse value.
        const nlIndex = chunk.indexOf('\n', chunkPos);
        if(nlIndex < 0) {
          break;
        }
        const value = JSON.parse(chunk.slice(chunkPos, nlIndex).toString(encoding));
        chunkPos = nlIndex + 1;
        this.push([this.key, value]);
        this.key = null;
      }
    }
    // Store left-over data for next time.
    chunk.copy(this.buffer, 0, chunkPos);
    this.bufLen = chunk.length - chunkPos;
    // Signal that we have finished with this chunk.
    callback();
  }
}

const watchExperiments = (rootDir) => {
  const experimentsState = {
    simpleTracesById: {},
    traceDataById: {},
    manifestsByExperiment: {},
    readTraceData: function(traceDataId) {
      const { filePath, type } = experimentsState.traceDataById[traceDataId];
      if(type === 'series') {
        const steps = [];
        const values = [];
        const trans = new TraceDataParser();
        const promise = new Promise((resolve, reject) => {
          trans.on('data', ([step, value]) => { steps.push(step); values.push(value); });
          trans.on('end', () => resolve({ id: traceDataId, type, steps, values }));
          trans.on('error', reject);
        });
        fs.createReadStream(filePath).pipe(trans);
        return promise;
      }
      if(type === 'artifact') {
        return new Promise((resolve, reject) => {
          fs.readFile(filePath, 'utf8', (err, contents) => {
            if(err) {
              reject(err);
            } else {
              const values = JSON.parse(contents);
              resolve({ id: traceDataId, type, values });
            }
          });
        });
      }
      throw new Error(`Unrecognised trace type: ${type}`);
    },
  };

  const reloadExperiments = (events) => {
    const changedExpSet = new Set(events
      .map(e => path.relative(rootDir, e.fsPath).split(path.sep)[0])
    );
    changedExpSet.delete('');
    const changedExperiments = [...changedExpSet]
      .filter(expId => isDirectory(path.join(rootDir, expId)));

    const allExperiments = fs.readdirSync(rootDir)
      .map(entry => path.resolve(rootDir, entry))
      .filter(fullPath => isDirectory(fullPath))
      .map(fullPath => path.basename(fullPath));

    const simpleTracesById = {};
    const traceDataById = {};
    const manifestsByExperiment = {};

    allExperiments.forEach(expId => {
      try {
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
              type: trace.type || 'series',
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
      } catch(ex) {
        console.warn(`Failed to load experiment: ${expId}`);
      }
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

  const serveClientApp = (req, res) => {
    const title = 'Trod';
    const assetManifest = JSON.parse(
      fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));
    const htmlContent = renderHtmlPage(title, assetManifest);
    res.send(htmlContent);
  };

  app.get('/', serveClientApp);
  app.get('/c/*', serveClientApp);

  app.get('/experiments', (req, res) => {
    res.json(Object.keys(experimentsState.manifestsByExperiment).map(id => ({ id })));
  });

  app.get('/experiments/:experimentId/traces', (req, res) => {
    const { experimentId } = req.params;
    if(!(experimentId in experimentsState.manifestsByExperiment)) {
      res.status(404).json({});
      return;
    }
    const traces = Object.values(experimentsState.simpleTracesById)
      .filter(trace => trace.experiment === experimentId);
    res.json(traces);
  });

  app.get('/experiments/:experimentId/views', (req, res) => {
    const { experimentId } = req.params;
    if(!(experimentId in experimentsState.manifestsByExperiment)) {
      res.status(404).json({});
      return;
    }
    const manifest = experimentsState.manifestsByExperiment[experimentId];
    const views = manifest.views.map(view => ({
      id: calcHash(`${experimentId}/${view.name}`),
      experiment: experimentId,
      ...view,
    }));
    res.json(views);
  });

  app.get('/tracedata/:traceDataId', (req, res) => {
    const { traceDataId } = req.params;
    if(!(traceDataId in experimentsState.traceDataById)) {
      res.status(404).json({});
      return;
    }
    experimentsState.readTraceData(traceDataId).then(traceData => {
      res.json(traceData);
    });
  });

  return app;
};
