const { logger } = require("@simpleanalytics/common");
const sqlite3 = require("sqlite3");

const { NODE_ENV = "development" } = process.env;
const DATABASE = `${__dirname}/newsalerts-${NODE_ENV}.db`;

function createTables(db, resolve, reject) {
  db.exec(
    `
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_name TEXT NOT NULL,
        platform_id TEXT,
        platform_rank INT,
        platform_title text NOT NULL,
        platform_points INT,
        website_link TEXT NOT NULL,
        website_title TEXT,
        website_description TEXT,
        keywords TEXT,
        first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        alerted_at TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS unique_platfrom_id
        ON articles (platform_id, platform_name);
    `,
    (error) => {
      if (error) return reject(error);

      // Add column and lett is fail when it already exists
      db.exec("ALTER TABLE articles ADD COLUMN keywords TEXT;", () => {});

      return resolve(db);
    }
  );
}

const getDatabase = () =>
  new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      DATABASE,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (error) => {
        if (error) {
          reject(error);
        } else if (error === null) {
          return createTables(db, resolve, reject);
        } else {
          reject(new Error("Unknown sqlite3 error"));
        }
      }
    );
  });

let db = null;

module.exports.query = async (...props) => {
  try {
    if (db === null) {
      db = await getDatabase();
    }

    return new Promise((resolve, reject) => {
      db.all(...props, function (error, tables) {
        if (error) reject(error);
        resolve(tables);
      });
    });
  } catch (error) {
    logger.error(error);
  }
};
