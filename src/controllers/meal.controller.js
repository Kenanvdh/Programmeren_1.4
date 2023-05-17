const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');

const mealController = {
  // UC-301 Create nieuwe meal
  createMeal: (req, res, next) => {
    const userId = req.userId;
    logger.info('Create new meal, cookId: ' + cookId);

    // De usergegevens zijn meegestuurd in de request body.
    const meal = req.body;
    logger.trace('meal = ', meal);

    // Hier zie je hoe je binnenkomende meal info kunt valideren.
    try {
      assert(user === {}, 'Userinfo is missing');
      assert(typeof meal.name === 'string', 'firstName must be a string');
      assert(
        typeof user.emailAdress === 'string',
        'emailAddress must be a string'
      );
    } catch (err) {
      logger.warn(err.message.toString());
      // Als één van de asserts failt sturen we een error response.
      next({
        code: 400,
        message: err.message.toString(),
        data: {}
      });

      // Nodejs is asynchroon. We willen niet dat de applicatie verder gaat
      // wanneer er al een response is teruggestuurd.
      return;
    }

    /**
     * De rest van deze functie maak je zelf af!
     * Voor tips, zie de PDF van de les over authenticatie.
     */
    let sqlStatement = 'INSERT INTO `meal` (`name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
      "( ?, ?, ?, ?, ?, ?, ?); " +
      'Select * FROM user WHERE id=?'

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [meal.name, meal.description, meal.imageUrl, meal.dateTime, meal.maxAmountofParticiapnts, meal.price, userId, userId],
          (err, results, fields) => {
            if (err) {
              logger.error(err.message);
              next({
                code: 409,
                message: err.message
              });
            }
            if (results) {
              logger.trace('Meal succesfully added, id: ', results[0].insertId);

              res.status(200).json({
                code: 200,
                message: 'Meal created',
                data: { meal }
              });
            }
          });
        pool.releaseConnection(conn);
      }
    });
  },

  // Niet verplicht!
  // UC-302 Updaten meal 
  // updateMeal: (req, res, next) => {
  // },

  // UC-303 Opvragen van overzicht van meals
  getAllMeals: (req, res, next) => {
    logger.info('Get all meals');

    let sqlStatement = 'SELECT * FROM `meal`';
    // Hier wil je misschien iets doen met mogelijke filterwaarden waarop je zoekt.

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            res.status(200).json({
              code: 200,
              message: 'Meal getAll endpoint',
              data: results
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },

  //UC 304 Opvragen meal
  getMeal: (req, res, next) => {
    logger.info('Get  meal');

    const mealId = parseInt(req.params.mealId);

    let sqlStatement = 'SELECT * FROM `meal` WHERE id = ? ';
    // Hier wil je misschien iets doen met mogelijke filterwaarden waarop je zoekt.

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [mealId], function (err, results, fields) {
          if (err) {
            logger.err(err.message);
            next({
              code: 409,
              message: err.message
            });
          }
          if (results) {
            logger.info('Found', results.length, 'results');
            res.status(200).json({
              code: 200,
              message: 'Meal get by id endpoint',
              data: results
            });
          }
        });
        pool.releaseConnection(conn);
      }
    });
  },

  //UC 305 Verwijderen meal
  deleteMeal: (req, res, next) => {
    const mealId = req.params.mealId
    const userId = req.userId
    logger.trace('Deleting meal id = ', mealId, ' by user id = ', userId)

    let sqlStatement = 'DELETE FROM  `meal` WHERE id=? AND cookId=?' +
      "( ?, ?, ?, ?, ?, ?, ?); " +
      'Select * FROM user WHERE id=?'

    pool.getConnection(function (err, conn) {
      // Do something with the connection
      if (err) {
        logger.error(err.code, err.syscall, err.address, err.port);
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(sqlStatement, [userId, cookId],
          (err, results, fields) => {
            if (err) {
              logger.error(err.message);
              next({
                code: 409,
                message: err.message
              });
            }
            if (results && results.affectedRows === 1) {
              logger.trace('Results: ', results);

              res.status(200).json({
                code: 200,
                message: 'Meal deleted with id: ', mealId,
                data: { id: results.insertId, ...meal }
              });
            } else {
              next({
                code: 401,
                message: 'Not authorized',
                data: {}
              })
            }
          });
        pool.releaseConnection(conn);
      }
    });
  }
};

module.exports = mealController;
