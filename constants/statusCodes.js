/**
 * HTTP Status Codes Constants
 * Centralized status codes for consistent use across the application
 */
const STATUS_CODES = {
  // Success
  OK: 200,
  
  // Client Error
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  
  // Server Error
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = STATUS_CODES;
