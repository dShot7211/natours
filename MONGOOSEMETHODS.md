1---await Tour.find();

2--await Tour.findById(req.params.id);
await Tour.find({ \_id: req.params.id }); //get tour using find only
await Tour.findOne({\_id:req.params.id})

3-- await Tour.create(req.body);

4--await Tour.findByIdAndUpdate(req.params.id, req.body, {
new: true,
runValidators: true,
});

5-- await Tour.findByIdAndDelete(req.params.id);

6-- await Tour.deleteMany();

7-- to remove fields from the response file tourcontroller in populate
const tour = await Tour.findById(req.params.id).populate({
path: 'guides',
select: '-\_\_v -passwordChange',
});

8-- // QUERY MIDDLEWARE
// in Query middleware this Always points to the current query
used in tourModal

9--- review modal file, show specfic feilds in the output
We use populate , and here we used it twice
see tour modal for populate as well

10--- virtual function see in the tour modal important

11-- when we use findByIdAndUpdate() the save middleware does not run so the password will not be updated in the db [file user controller => update user]

12-- create query \*\*\*
when we don't await the query it stays query
let query = Model.findById(req.params.id);
if (popOptions) query = query.populate(popOptions);

--Stop the validation we do in the modal while creating documents
await User.create(users, { validateBeforeSave: false });

-- INDEXING vid167 [used in tour modal]very imp when we are quering for huge amount of data,, with indexing we store the ids of prices(example) in the index fields with sort of asc and desc, and it is much more efficient to query of data in the index field rather that the whole table

{{URL}}api/v1/tours?price[lt]=1000
we used the filter for price here , so mongoDb will only examin 3 documents instead of 9 in oour tour schema
"totalDocsExamined": 3,

COMPOUND INDEX index with 2 fields, cause when we are querying with 2 fields , price and loc example

<!-- vid 168 -->

-- STATIC feature of mongoose to write middlewares, on creating, updating documents
--post middleware does not get access to next

-- in query/find middleware this points to current query, and document/save middleware this points to current document
tourSchema.pre('save') this save makes the middleware document middleware
'find' makes the middleware querymiddleware
