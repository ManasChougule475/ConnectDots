const express = require('express');
const { route } = require('./routes');
const port = 8000;
const app = express();

// mongoose & user schema
const db = require('./config/mongoose');
// const User = require('./models/user');

// cookie-parser
const cookieParser  = require('cookie-parser');
app.use(express.urlencoded());
app.use(cookieParser());  

//using static files
app.use(express.static('./assets'));

//extract the styles from subpages(ejs files) & put them into layout.ejs at specified locationseet
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