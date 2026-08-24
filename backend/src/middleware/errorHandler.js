function errorHandler(err, req, res, next) {
  // Handle Express body-parser malformed JSON syntax errors gracefully
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        status: 400,
        message: 'Malformed JSON payload in request body.',
        code: 'MALFORMED_JSON',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle Multer file upload & fileFilter validation errors gracefully as HTTP 400 Bad Request
  if (err.name === 'MulterError' || (err.message && err.message.includes('Invalid file type'))) {
    return res.status(400).json({
      error: {
        status: 400,
        message: err.message || 'File upload validation error.',
        code: 'INVALID_FILE_UPLOAD',
        timestamp: new Date().toISOString()
      }
    });
  }

  console.error('❌ Server Error:', err.message || err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An internal server error occurred.';
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  res.status(status).json({
    error: {
      status,
      message,
      code,
      timestamp: new Date().toISOString()
    }
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      status: 404,
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
