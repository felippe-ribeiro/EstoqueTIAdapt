const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    database: 'estoqueceti',
    password: '125lipi',
    multipleStatements: true
  });

  module.exports = connection