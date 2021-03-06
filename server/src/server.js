require('dotenv').config();
require('./config/database');
const express = require('express');
const cors = require('cors');
const server = express();
const routes = require('./routes')
const morgan = require('morgan')
const port = process.env.PORT || 3333;
const apiBaseUrl = process.env.API_BASE_URL || '/api';

const corsOptions = {
  optionsSuccessStatus: 200
};

server.use(express.json({ extended: false }));
server.use(cors(corsOptions));
server.use(morgan('tiny'));
server.get('/', (req,res) => res.send("Bem vindo a API 1.0 do AncapHub"))
server.use(apiBaseUrl, routes)

server.use(function(err, req, res, next) {
  res.status(500).json({ message: err.message});
});

server.use('/public', express.static('public'));

server.listen(port, function () {
  console.log(`BACKEND está rodando na porta ${port}.`,`http://localhost:${port}/`);
});

module.exports = server;
