'use strict';

const Hapi = require('hapi');
const fs = require('fs');
const low = require('lowdb');
const db = low('db.json', {
  storage: require('lowdb/lib/file-async'),
});
const server = new Hapi.Server();

db.defaults({ users: [], images: [] })
  .value()
  
const users = db.get('users');
const images = db.get('images');

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
        .find({ id: parseInt(request.params.id) })
        .value();
      
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

server.route({
  method: 'PUT',
  path: '/user/{id}',
  handler: (request, reply) => {
    const user = users
      .find({id: parseInt(request.params.id)})
      .assign(request.payload)
      .value();
      
    return reply(user).code(200);
  }
})

server.route({
  method: 'POST',
  path: '/login',
  handler: (request, reply) => {
    const user = users
      .find({ username: request.payload.firstname, password: request.payload.lastname })
      .value();
      
    const response = user ? { login: true, user } : { login: false };
    
    return reply(response).code(200);
  }
})

server.route({
  method: 'POST',
  path: '/signup',
  handler: (request, reply) => {
    let newUser;
    const usernameTaken = users
      .find({ username: request.payload.username })
      .value();
      
    if (!usernameTaken) {
      request.payload.id = Date.now();
      newUser = users.push(request.payload).last().value();

      return reply({ usernameTaken: false, newUser }).code(200);
    } else {
      return reply({ usernameTaken: true }).code(200);
    }
  }
})

server.route({
  method: 'POST',
  path: '/uploadimage',
  handler: (request, reply) => {
    const imageData = JSON.parse(request.payload);
    imageData.id = Date.now();

    const image = images
      .push(imageData)
      .value();
      
    return reply(image).code(200);
  }
})

server.route({
  method: 'GET',
  path: '/images',
  handler: (request, reply) => {
    return reply(images.value()).code(200);
  }
})

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});