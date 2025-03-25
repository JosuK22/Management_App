// 404 Error Handling Middleware
module.exports = (err, req, res, next) => {
    if (err.status === 404) {
      return res.status(404).json({
        message: 'Page not found',
        status: 404
      });
    }
  
    // General error handler for other types of errors
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
      status: err.status || 500
    });
  };
  