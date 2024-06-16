const mongoose = require('mongoose');
const env = require('./environment');
const db_name = env.db;  
mongoose.connect('mongodb://127.0.0.1/db_name');  

const db = mongoose.connection;


db.on('error' , console.log.bind(console , 'Error while connecting to MongoDB'));

db.once('open' , function(){
    console.log("Successfully connected to database :: MongoDB");
})

module.exports = db;

