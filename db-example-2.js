// get the client
const mysql = require('mysql2');

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'shareameal',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0
});

// For pool initialization, see above
pool.getConnection(function (err, conn) {
  if (err) {
    console.log('error');
  }
  if (conn) {
    conn.query('SELECT `id`, `name` FROM `meal`',
      function (err, results) {
        if (err) {
          console.log('Error: ', err.sqlMessage);
        }
        console.log('Results: ', results); // results contains rows returned by server
      }
    );
  }
  pool.releaseConnection;
});