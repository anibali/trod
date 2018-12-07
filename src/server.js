import http from 'http';
import path from 'path';
import { ArgumentParser } from 'argparse';

import createApp from './createApp';


const parseArgs = (argv) => {
  const parser = new ArgumentParser({
    // TODO: Program details like version, description, etc
  });

  parser.addArgument(['-p', '--port'], {
    help: 'server port',
    defaultValue: 3000,
  });

  parser.addArgument(['-d', '--dir'], {
    help: 'root experiment directory',
    defaultValue: path.join(process.cwd(), 'experiments'),
  });

  return parser.parseArgs(argv.slice(2));
};


// Server main function
export default (argv) => {
  const args = parseArgs(argv);

  createApp(args.dir).then((app) => {
    const server = http.createServer(app);
    server.listen(args.port, () => {
      console.log('Server started.');
    });
  });
};
