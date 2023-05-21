//
// Authentication controller
//
const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/mysql-db');
const { logger, jwtSecretKey } = require('../util/utils');

module.exports = {
    //UC-101 - Inloggen
    login(req, res, next) {
        logger.info(req.body);
      
        pool.getConnection((err, connection) => {
          if (err) {
            logger.error('Error getting connection from pool');
            return res.status(500).json({
              status: 500,
              message: err.code
            });
          } else {
            logger.trace('Login called');
            const sqlStatement = 'SELECT * FROM `user` WHERE `emailAdress`=?';
      
            connection.query(sqlStatement, [req.body.emailAdress], function (err, results, fields) {
              connection.release(); // Release the connection back to the pool
      
              if (err) {
                logger.error(err.message);
                res.status.json({
                  status: 409,
                  message: err.message
                });
              } else {
                if (results.length === 0) {
                  res.status(404).json({
                    status: 404,
                    message: 'User not found',
                    data: {}
                  });
                } else {
                  const user = results[0];
      
                  if (user.password === req.body.password) {
                    const { password, id, ...userInfo } = user;
      
                    const payload = {
                      userId: id
                    };
      
                    logger.info('Payload aangemaakt', payload);
      
                    jwt.sign(payload, jwtSecretKey, { expiresIn: '2d' }, (err, token) => {
                      logger.info('Token gegenereerd: ', token);
                      if (token) {
                        res.status(200).json({
                          status: 200,
                          message: 'Login endpoint',
                          data: {
                            id,
                            ...userInfo,
                            token: token
                          }
                        });
                      } else {
                        logger.info('Failed to generate token');
                        res.status(500).json({
                          status: 500,
                          message: 'Failed to generate token',
                          data: {}
                        });
                      }
                    });
                  } else {
                    res.status(400).json({
                      status: 400,
                      message: 'Not authorized',
                      data: {}
                    });
                    next();
                  }
                }
              }
            });
          }
        });
      },
      

    /*
     * Validatie functie voor /api/login,
     * valideert of de vereiste body aanwezig is.
     */
    validateLogin(req, res, next) {
        logger.info('validateLogin called')
        // Verify that we receive the expected input
        try {
            assert(
                typeof req.body.emailAdress === 'string',
                'emailAdress must be a string.'
            );
            assert(
                typeof req.body.password === 'string',
                'password must be a string.'
            );
            next();
        } catch (ex) {
            res.status(400).json({
                status: 400,
                message: "Not authorized",
                data: {}
            });
        }
    },

    validateToken(req, res, next) {
        logger.info('validateToken called');
        // logger.trace(req.headers)
        // The headers should contain the authorization-field with value 'Bearer [token]'
        const authHeader = req.headers.authorization;
        logger.info('AuthHeader:', authHeader)
        if (!authHeader) {
            logger.info('No authHeader found!')
            res.status(401).json({
                status: 401,
                message: 'Authorization header missing!',
                data: {}
            });
        } else {
            /**
             * We hebben de headers. Lees het token daaruit, valideer het token
             * en lees de payload daaruit. De userId uit de payload stop je in de req,
             * en ga naar de volgende endpoint.
             */

            const token = authHeader.substring(7, authHeader.length)
            const payload = jwt.decode(token); // Decode the payload

            if (!payload) {
                logger.info('Invalid token!')
                res.status(401).json({
                    status: 401,
                    message: 'Invalid token!',
                    data: {}
                });
            } else {
                // Store the userId in the request object
                req.userId = payload.userId;
                logger.info('Payload', payload, 'decoded successfully!')
                next();
            }
        }
    }
};
