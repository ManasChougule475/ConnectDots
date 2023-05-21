const express = require('express');
const { route } = require('./routes');
const port = 8000;
const app = express();

// using the rout
app.use('/' , require('./routes'));



app.listen(port , function(err){
    if(err){
        console.log(`Error :-  ${err}`);
    }
    console.log(`Success in running the server on port ${port}`);
})