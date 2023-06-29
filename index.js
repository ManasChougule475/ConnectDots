const express = require('express');
const { route } = require('./routes');
const port = 8000;
const app = express();

// mongoose & user schema
const db = require('./config/mongoose');
// const User = require('./models/user');


// using express-session , it is used to encrypt the user id and put inside the cookie while serializing
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');

// const MongoStore = require('connect-mongo')(session);
//TypeError: Class constructor MongoStore cannot be invoked without 'new'
const MongoStore = require('connect-mongo'); 

// SASS
const sassMiddleware = require('node-sass-middleware');

app.use(
    sassMiddleware({
        src: './assets/scss',
        dest: './assets/css',
        debug: true,
        outputStyle: 'extended',
        prefix: '/css'
     })
);


// cookie-parser
const cookieParser  = require('cookie-parser');
// app.use(express.urlencoded());
app.use(express.urlencoded({extended: true})); 
app.use(cookieParser());  

//using static files
app.use(express.static('./assets'));

//extract the styles from subpages(ejs files) & put them into layout.ejs at specified locationseet
app.set('layout extractStyles' , true);
app.set('layout extractScripts' , true);

// setting up the view engine
app.set('view engine' , 'ejs');
app.set('views' , './views');


//using express layouts
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);

// using the express-session
app.use(session({
    name:'codeial', 
    //TODO: update this secrete key at the time of deployment
    secret: 'blahsomething' ,
    saveUninitialized : false, 
    resave : false, 
    cookie : {
        maxAge : (1000 * 60 * 100)
    },

    store : new MongoStore(
        {
            // mongooseConnection : db,
            mongoUrl: 'mongodb://127.0.0.1/codeial_development',    
            autoRemove : 'disabled'
        },
        function(err){
            console.log(err || 'connect-mongodb setup ok');
        }
    )
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

// using the route
app.use('/' , require('./routes'));



app.listen(port , function(err){
    if(err){
        console.log(`Error :-  ${err}`);
    }
    console.log(`Success in running the server on port ${port}`);
})