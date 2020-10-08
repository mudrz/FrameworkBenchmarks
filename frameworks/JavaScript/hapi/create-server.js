/**
 * Currently commenting out redis caching as there is no
 * working implementation for the benchmark suite.
 */

const Hapi = require('@hapi/hapi');

const Handler = require(`./handlers/${process.env.NODE_HANDLER}`);

const JsonSerialization = (req, reply) =>
  reply
    .response({ message: 'Hello, World!' })
    .header('Server', 'hapi');

const Plaintext = (req, reply) =>
  reply
    .response('Hello, World!')
    .header('Server', 'hapi')
    .header('Content-Type', 'text/plain');

const start = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 8080,
        host: '0.0.0.0',
        compression: false,
    });
    await server.register(require('@hapi/vision'));
    server.views({
        engines: {
            html: require('handlebars')
        },
        path: __dirname + '/views/'
    });

    // Makes routing simpler as tfb routes are all GET's
    // We also don't use the nifty route features that Hapi has
    // to offer such as attaching a validator
    const Route = (path, handler) =>
      server.route({ method: 'GET', path, handler });

    Route('/json', JsonSerialization);
    Route('/plaintext', Plaintext);

    Route('/db', Handler.SingleQuery);
    Route('/queries', Handler.MultipleQueries);
    Route('/fortunes', Handler.Fortunes);
    Route('/updates', Handler.Updates);

    await server.start();
    console.log('Hapi worker started and listening on ' + server.info.uri + " " + new Date().toISOString(" "));
}
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

start();
