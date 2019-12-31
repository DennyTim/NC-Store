import {
  NextFunction,
  Request,
  Response,
} from 'express';

export const advancedResults = ( model, populate? ) =>
  async ( req: Request, res: Response, next: NextFunction ) => {

    let query;
    // Clone query object
    const reqQuery = { ...req.query };
    // Fields to exclude
    const removeFields = [ 'select', 'sort', 'page', 'limit' ];
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(( param: string ) => delete reqQuery[param]);

    const queryStr = JSON.stringify(reqQuery)
                         .replace(/\b(gt|gte|lt|lte|in)\b/g,
                           ( match ) => `$${ match }`,
                         );
    query = model.find(JSON.parse(queryStr));
    // SELECT fields
    if (req.query.select) {
      const fields = req.query.select
                        .split(',')
                        .join(' ');
      query = query.select(fields);
    }

    // SORT
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',')
                        .join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex)
                 .limit(limit);

    if (populate) {
      query = query.populate(populate);
    }

    // Executing query
    const results = await query;

    // Pagination result
    const pagination: any = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    const resultsObj = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };

    Object.assign(res, { advancedResults: { ...resultsObj } });

    next();
  };
