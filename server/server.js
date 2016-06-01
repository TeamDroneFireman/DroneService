var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  //start simulator and mavProxy
  const spawn = require('child_process').spawn;
  const simulatorStarter = spawn('dronekit-sitl', [
    'copter',
    '--home=',
    '20,20,20,20'
  ]);

  const mavProxyStarter = spawn('mavproxy.py',[
    '--master',
    'tcp:127.0.0.1:5760',
    '--sitl',
    '127.0.0.1:5501',
    '--out',
    '127.0.0.1:14550',
    '--out',
    '127.0.0.1:14551'
  ]);

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
