const advancedresults = (model, populate) => async (req, res, next) => {
    let query;

    // To delect select keyword from query
    const reqQuery = { ...req.query };
    const removeQuery = ['select', 'sort', 'page', 'limit'];
    removeQuery.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    //To add $ symbol to req query
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    console.log(queryStr);

    //Finding resource
    query = model.find(JSON.parse(queryStr));

    //Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy)
    }
    else {
        query = query.sort('-createdAt');
    }

    //Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    const results = await query;

    //pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }


    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
}
module.exports = advancedresults;