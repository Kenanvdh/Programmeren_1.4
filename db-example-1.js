// get the client
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'shareameal',
  port: 3306
});

// simple query
connection.query(
  'SELECT `id`, `name` FROM `meal`',
  function(err, results) {
    if(err){
        console.log('Error: ', err.sqlMessage);
    }
    console.log('Results: ', results); // results contains rows returned by server
  }
);

connection.end();