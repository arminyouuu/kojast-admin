export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.status) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      status: 409,
      message: 'ورودی تکراری. این رکورد از قبل وجود دارد..'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      status: 400,
      message: 'Invalid reference. Related record does not exist.'
    });
  }

  res.status(500).json({
    status: 500,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Endpoint not found'
  });
};
