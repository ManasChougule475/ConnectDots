const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');
const { error } = require('console');


// authentication using passport
passport.use(new LocalStrategy({   // telling passport to use the LocalStrategy that we have created
        usernameField: 'email',
        passReqToCallback : true // allows up to set first argument as req
    },
    function(req,email, password, done){ 

        User.findOne({email: email}) // NOTE : this findOne will check user with given email is in database or not 
        .then((user)=>{
            if(!user || user.password != password){
                // console.log('Invalid Username/Password');
                req.flash('error' , 'Invalid Username/Password');
                return done(null, false); // false: user not found
            }
            else{
                return done(null, user); // null : no error , user : user is found
            }
        })
        .catch((err)=>{
            // console.log('Error in finding user --> Passport');
            req.flash('error' , err);
            return done(err);
        });
    }


));



passport.serializeUser(function(user, done){
    done(null, user.id); 

})



// deserializing the user from the key in the cookies
passport.deserializeUser(function(id, done){
    User.findById(id) // NOTE : this findById will check user with given user id is in cookie or not 
    .then((user)=>{
        return done(null, user);
    })
    .catch((err)=>{
        console.log('Error in finding user --> Passport'); // when cookie sent back to the server , the deserializeUser done now , user is found
        return done(err);
    })
});



// middlewares added 
passport.checkAuthentication = function(req,res,next){
    if(req.isAuthenticated()){
        return next(); 
    }
    return res.redirect('/users/sign-in'); 
}

passport.setAuthenticatedUser = function(req , res , next){ 
    if(req.isAuthenticated()){
        res.locals.user = req.user; // sending signed in info in req.users to locals for views(user will be available in view now)
    }
    next();
}


module.exports = passport;