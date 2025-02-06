const { ValidationError } = require('sequelize');

function errorHandler(err, req, res, next) {
    console.error(err);

    // Handle Sequelize validation errors
    if (err instanceof ValidationError) {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Handle other types of errors
    if (err.status) {
        return res.status(err.status).json({
            error: err.message
        });
    }

    // Default error
    res.status(500).json({
        error: 'Internal Server Error'
    });
}

module.exports = errorHandler;