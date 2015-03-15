var Hapi    = require('hapi');
var Basic   = require('hapi-auth-basic');
var Hoek    = require('hoek');
var AuthJWT = require('hapi-auth-jwt2')
var Joi     = require('joi');
var ES      = require('esta');  // https://github.com/nelsonic/esta
var port    = process.env.PORT || 1337; // heroku define port or use 1337
var server  = new Hapi.Server();
var Path    = require('path');
server.connection({ port: port });

server.register([ {register: Basic}, {register: AuthJWT} ], function (err) {

  server.auth.strategy('basic', 'basic', {
    validateFunc: require('./api/lib/auth_basic_validate.js')
  });

  server.auth.strategy('jwt', 'jwt', 'required',  {
    key: process.env.JWT_SECRET,
    validateFunc: require('./api/lib/auth_jwt_validate.js')
  });

  server.views({
    engines: {
        html: require('handlebars')
    },
    path: Path.join(__dirname, 'front/views')
  });
  var api    = require('./api/routes.js');
  // var front  = require('./front/routes.js');
  var front = [{
    path: '/',
    method: 'GET',
    config: {
      auth: false,
      handler: function(request, reply) {
        reply.view("index", {fortune:"everything is awesome"});
      }
    }
  }]

  var routes = Hoek.merge(api, front);

  server.route(routes);

});

server.start(function(){
  console.log('Now Visit: http://localhost:'+port);
});


module.exports = server;