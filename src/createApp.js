import express from 'express';
import path from 'path';
import fs from 'fs';


const renderHtmlPage = (title, assetManifest) => (`
  <!DOCTYPE html>
  <html>
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
      res.status(200).send(htmlContent);
    });
    return app;
  });
