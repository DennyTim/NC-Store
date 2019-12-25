// @desc    Logs request to console
export const logger = ( req, res, next ) => {
  global.console.log(`
    ${ req.method } ${ req.protocol }://${ req.get('host') }${ req.originalUrl }`,
  );
  next();
};
