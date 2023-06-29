const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');


// authentication using passport
passport.use(new LocalStrategy({   // telling passport to use the LocalStrategy that we have created
        usernameField: 'email'
    },
    function(email, password, done){ // done is inbuilt to passport & automatically gets called
        // find a user and establish the identity

        // User.findOne({email: email}, function(err, user)  {
        //     if (err){
        //         console.log('Error in finding user --> Passport');
        //         return done(err);
        //     }

        //     if (!user || user.password != password){
        //         console.log('Invalid Username/Password');
        //         return done(null, false); // false: user not found
        //     }

        //     return done(null, user); // null : no error , user : user is found
        // });

        // above code gives error : MongooseError: Model.findOne() no longer accepts a callback 
        // so use either use asyn wait or promises
        User.findOne({email: email}) // NOTE : this findOne will check user with given email is in database or not 
        .then((user)=>{
            if(!user || user.password != password){
                console.log('Invalid Username/Password');
                return done(null, false); // false: user not found
            }
            else{
                return done(null, user); // null : no error , user : user is found
            }
        })
        .catch((err)=>{
            console.log('Error in finding user --> Passport');
            return done(err);
        })
    }


));


// serializing the user to decide which key is to be kept in the session cookie
// it pickes up the info from user that has to place in session cookie
passport.serializeUser(function(user, done){
    done(null, user.id); // using findOne user is found and here we putting user.id in encrypted form inside cookie, then this cookie will be send to the web browser
});



// deserializing the user from the key in the cookies
passport.deserializeUser(function(id, done){
    // User.findById(id, function(err, user){
    //     if(err){
    //         console.log('Error in finding user --> Passport');
    //         return done(err);
    //     }

    //     return done(null, user); 
    // });

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
        return next(); //if user has signed in then this middleware will redirect to next action 
    }
    return res.redirect('/users/sign-in'); // if user not signed in 
} 

passport.setAuthenticatedUser = function(req , res , next){ // set user for the views
    if(req.isAuthenticated()){
        res.locals.user = req.user; // sending signed in info in req.users to locals for views(user will be available in view now)
    }
    next();
}


module.exports = passport;