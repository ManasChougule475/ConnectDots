const express = require('express');
const { route } = require('./routes');
const port = 8000;
const app = express();
require('./config/view-helpers')(app);            
    
// vim alternative setup 
require('dotenv').config();   // env file is accessed here 
// 
const { sessionMiddleware } = require('./config/sessionStore'); 
// mongoose & user schema
const db = require('./config/mongoose');
// const User = require('./models/user');
   


// using express-session , it is used to encrypt the user id and put inside the cookie while serializing
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');  
const passportJWT = require('./config/passport-jwt-strategy');  
const passportGoogle = require('./config/passport-google-oauth2-strategy');  

// const MongoStore = require('connect-mongo')(session);
//TypeError: Class constructor MongoStore cannot be invoked without 'new'
const MongoStore = require('connect-mongo'); 


// require connect-flash middleware & custome middleware
const flash = require('connect-flash');
const customMware = require('./config/middleware');


// cookie-parser
const cookieParser  = require('cookie-parser');
   
// app.use(express.urlencoded());
  
app.use(express.urlencoded({extended: false})); 
app.use(cookieParser());     


// setup the chat server to be used with socket.io
const chatServer = require('http').Server(app);
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(5000);  



//using static files & environment
const env = require('./config/environment');
app.use(express.static(env.asset_path)); 

// morgan
const logger = require('morgan');
app.use(logger(env.morgan.mode , env.morgan.options));

//making upoloads path available to the browser
app.use('/uploads' , express.static(__dirname + '/uploads'))

//extract the styles from subpages(ejs files) & put them into layout.ejs at specified locationseet
app.set('layout extractStyles' , true);
app.set('layout extractScripts' , true);

// setting up the view engine
app.set('view engine' , 'ejs');
app.set('views' , './views');


//using express layouts
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);



app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

// used connect-flash middleware & custome middleware
app.use(flash());
app.use(customMware.setFlash);



// using the route
app.use('/' , require('./routes'));


app.listen(port , function(err){           
    if(err){
        
    }
    
})