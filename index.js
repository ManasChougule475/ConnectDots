const express = require('express');
const { route } = require('./routes');
const port = 8000;
const app = express();

//using static files
app.use(express.static('./assets'));

//using Styles & Scripts to refer links other ejs files into layout.ejs
app.set('layout extractStyles' , true);
app.set('layout extractScripts' , true);

//using express layouts
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);

// using the route
app.use('/' , require('./routes'));

// setting up the view engine
app.set('view engine' , 'ejs');
app.set('views' , './views');

app.listen(port , function(err){
    if(err){
        console.log(`Error :-  ${err}`);
    }
    console.log(`Success in running the server on port ${port}`);
})