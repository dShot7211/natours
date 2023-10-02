collection = table
document = rows
npm run watch:js for parcel bundle

how to do refrencing see the bookingModal and vid 213

mongoose
Schema in mongoose is where we model our data, by describing the structure of data, default values and validations.
mongoose
Model is a wrapper for the schema providing an interface to the database for CRUD operations.

To create a mongoose model we need schema

SEE MIDDLEWARE VIDS AGAIN
// we can add something to the req body with the help of the middleware
// we added current time to each request
app.use((req, res, next) => {
req.requestedTime = new Date().toISOString();
next();
});

the Model.prototype methods in mongoogse documentation are methods on the instance of a model not on model itself
1 this is instance of model
// const tour = new Tour({})
// tour.save()

2 this is the Tour model itself
const tours = await Tour.find();

<!-- HOW TO ACCESS THE COMMANDS THAT WE WRITE INTERMINAL -->

process.argv = is an array of our commands written in terminal

in vid 95 at 10:20 a good info on objects in java script

IMPORTANT SECTIONS OF THE COURSE
1: FILTERING API, in vid 95
eg - ?duration=5&difficulty=easy

Tour.find() will return an query so we can chain other methods to this query like sort pagination etc
but we do not have to awiat the find query this will result in the execution of the query and we can no loger be able to chain methods to it
2: GREATER THAN EQUALS LIKE API vid 96

npm run start:prod
to start in prod

regular expression match text between quotes

to loop over objects in Object.values()

join a array of strings
errors.join('. ')

jwt expire time can be given like this
JWT_EXPIRES_IN=24h, 90d, 5m, 3s

match() => returns matched string
this method matches stirng and returns true or false
console.log(/^([a-z0-9]{5,})$/.test('abc1')); // false

see how to give 3 login attemps only and email verification in vid 141 comments
passwordAttempts: {
type: Number,
default: 0,
select: false
},
isBlocked: {
type: Boolean,
default: false,
select: false
},
unBlockDate: {
type: Date,
select: false
}
//Users have 3 attempts
userSchema.methods.loginAttempts = function() {
if (!this.isBlocked) {
if (this.passwordAttempts >= 2) {
this.isBlocked = true;
//set unlock time
const unlockTime = 1000 _ 60 _ 2; //only for testing
this.unBlockDate = Date.now() + unlockTime;
}
this.passwordAttempts++;
} else if (this.unBlockDate - Date.now() < 0) {
this.resetBlockSettings();
}
};

userSchema.methods.resetBlockSettings = function() {
this.isBlocked = false;
this.unBlockDate = undefined;
this.passwordAttempts = 0;
};

TO DELETE and IMPORT ALL THE DATA IN DB FROM SCRIPT
node ./dev-data/ata/import-dev-data.js --delete
node ./dev-data/data/import-dev-data.js --import

<!-- SEE THE MONGOOSE METHODS FILE AS WELL -->

// ////////////////////

// GeoJSON in order to specify geospacial data
// the object which we are inside is no longer for schema type options obj it is geoSpacial obj
// in order for this obj to be recongnized as geoSpacial obj we need corrdinates and type of type string and should be point or polygon

      // *** for us to embedd an document in an document like tour we have to make it an array
    // embedd locations document  in the tour document, the below column in db is the array of the above locations startLoacation

// define what values this field will take // point is the geometrical point, it can be circle triangle , polygon etc

// we expect an array of numbers in this field

SEE DATA ATTRIBUTE IN HTML HOW TO PASS DATA INTO HTML

<!-- from the start of the section 12 i have started working on the given files by jonas in the bootcamp folder -->

MULTER
const upload = multer({dest: 'public/img/users'}) the most basic multer config

For single image
upload.single('photo') photo= name of the field that is going to hold this file
this upload .single middleware will put the file on the req obj

---

name: leo
photo: 'postman selected photo

---

req.file contains the file
the body will only be the name and not the image too

MULTER CONFIGURATION
const multerStorage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, 'public/img/users');
},
filename: (req, file, cb) => {
// user-454545dfdsfd-33262585.jpeg
const ext = file.mimetype.split('/')[1];
cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
},
});

destination is a func that has access to req the file and cb we can pass errors in here
filename is a func that has access to req the file and cb we can pass errors in here

cb = first arg is error if no then null then the destination

MULTER CHECK IF ITS A FILE /NOT
const multerFilter = (req, file, cb) => {
if (file.mimetype.startsWith('image')) {
cb(null, true);
} else {
cb(new AppError('Not an image! Please upload only images.', 400), false);
}
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

MULTER RESIZE THE PHOTO
when we are doing image processing we need to store the image into memory and not the disk rightaway

const multerStorage = multer.memoryStorage();

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
if (!req.file) return next();

req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

<!-- sharp is a npm package -->

await sharp(req.file.buffer)
.resize(500, 500)
.toFormat('jpeg')
.jpeg({ quality: 90 })
.toFile(`public/img/users/${req.file.filename}`);

next();
});

UPLOAD MULTIPLE FILES AT THE SAME TIME

if we have one image and an array of images too
exports.uploadTourImages = upload.fields([
// req.files
{ name: 'imageCover', maxCount: 1 },
{ name: 'images', maxCount: 3 },
]);

if we have only array of images
// upload.array('images', 5); req.files
if only one file
// upload.single('image') req.files

RESIZE ALL THESE IMAGES
exports.resizeTourImages = catchAsync(async (req, res, next) => {
if (!req.files.imageCover || !req.files.images) return next();

// 1) Cover Image
req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
await sharp(req.files.imageCover[0].buffer)
.resize(2000, 1333)
.toFormat('jpeg')
.jpeg({ quality: 90 })
.toFile(`public/img/tours/${req.body.imageCover}`);

// 2)
req.body.images = [];
await Promise.all(
req.files.images.map(async (file, index) => {
const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })

);
next();
});
