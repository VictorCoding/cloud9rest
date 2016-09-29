'use strict';

const Hapi = require('hapi');
const fs = require('fs');
const low = require('lowdb');
const db = low('db.json', {
  storage: require('lowdb/lib/file-async'),
});
const server = new Hapi.Server();

db.defaults({ users: [] })
  .value()
  
const users = db.get('users');

server.connection({ port: 3002 });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Welcome to Cloud9!');
    }
});

server.route({
    method: 'POST',
    path: '/user',
    handler: function (request, reply) {
        request.payload.id = Date.now();
        const user = users.push(request.payload).last().value();
        
        return reply(user).code(200);
    }
});

server.route({
  method: 'GET',
  path: '/user/{id}',
  handler: function (request, reply) {
      const user = users
        .find({ id: req.payload.id })
        .value()
        
      return reply(user).code(200);
  }
});

server.route({
    method: 'GET',
    path: '/users',
    handler: function (request, reply) {
        return reply(users.value()).code(200);
    }
});

server.route({
  method: 'DELETE',
  path: '/user/{id}',
  handler: (request, reply) => {
    users.remove({ id: parseInt(request.params.id) }).value();
    
    return reply({ deleted: true }).code(200);
  }
})

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});