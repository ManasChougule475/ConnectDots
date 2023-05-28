const mongoose = require('mongoose');

//mongoose.connect('mongodb://localhost/codeial_development');
mongoose.connect('mongodb://127.0.0.1/codeial_development');

const db = mongoose.connection;


db.on('error' , console.log.bind(console , 'Error while connecting to MongoDB'));

db.once('open' , function(){
    console.log("Successfully connected to database :: MongoDB");
})

module.exports = db;

