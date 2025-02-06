const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            connectTimeout: 10000
        }
    }
);

// Test and initialize the database connection
async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL database');
        
        // Sync all models
        await sequelize.sync({ force: true }); // This will create the tables
        console.log('Database tables created');
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

initDatabase();

module.exports = sequelize;