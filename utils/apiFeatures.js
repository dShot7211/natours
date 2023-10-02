/* eslint-disable node/no-unsupported-features/es-syntax */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 127.0.0.1:3000/api/v1/tours?duration=5&difficulty=easy
  // 127.0.0.1:3000/api/v1/tours?duration[gte]=5&ratingAverage[gte]=4.6
  filter() {
    const queryObj = { ...this.queryString };

    // Excluding fields does not appear to be necessary in latest Mongoose version.   said by one user in comment (not sure)
    // chart way of removing page sort limit etc  const { page, sort, limit, fields, ...queryObj } = req.query;

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // {duration:'5',difficulty:'easy'}
    // how the query obj will look
    // { difficulty:'easy', duration: { gte: 5 } }
    // how mogoose needs the query obj
    // { difficulty:'easy', duration: { $gte: 5 } }

    // 2- Advance Filtering

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 127.0.0.1:3000/api/v1/tours?sort=-price descending / sort=price ascending
  // 127.0.0.1:3000/api/v1/tours?sort=-price,ratingAverage   / sort by 2 parameters
  // { sort : 'price' }
  // { sort : '-price,-ratingAverage' }
  // how mongoose needs it
  // this.query.sort(-price -ratingsAverage)
  // this.query.sort(-price ratingsAverage)
  //  give api data back from created at  asc sort by default
  // this.query = this.query.sort('-createdAt _id');

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(/,/g, ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt _id');
    }

    return this;
  }

  //  we will only get these filds in the response
  // 127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price

  // if we want to remove some fields form the response data we can give - before field name
  //  we will have everything every field in the response except name and duration
  // 127.0.0.1:3000/api/v1/tours?fields=-name,-duration,

  // how query will look
  // this.query.select('name duration difficulty price')

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replace(/,/g, ' ');
      this.query = this.query.select(fields);
    } else {
      // -__v ---> exclude the __v field
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
