// middleware/validateInput.js
// Input validation middleware using express-validator

const { validationResult } = require('express-validator');

/**
 * Validation middleware
 * Checks for validation errors and returns them if found
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = { validate };
