const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(
    'UNCAUGHT EXCEPTION! like some variable is not defined 💥 shutting down'
  );
  console.log(err.name, err.message);
  process.exit(1);
});

// this file is new app js
const app = require('./newFileStruct3');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful ✅');
  });

//console.log(app.get('env')); //to get the evironment that we are in  dev or production this env is set by express
// this command will  read the variables fromm the file and save it into the node js environment variables.
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App Running on Port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// throwing an uncaughtException
// console.log(X);
