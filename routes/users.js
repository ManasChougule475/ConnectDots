const express = require('express');
const router = express.Router(); // this const router is limited to this module only
const usersController = require('../controllers/users_controller');
const passport = require('passport');

// router.get('/profile'  ,  usersController.profile);
// router.get('/profile' , passport.checkAuthentication ,  usersController.profile);  // error: route.get() requires a callback function but got a [object undefined]
router.get('/profile' , (req,res,next)=>{  // now to access the profile user need to sign in first
    if(req.isAuthenticated()){
        return next(); 
    }
    return res.redirect('/users/sign-in'); 
},  usersController.profile);

router.get('/sign-up' , usersController.signUp);

router.get('/sign-in' , usersController.signIn);

router.post('/create' , usersController.create);

// router.post('/create-session' , usersController.createSession);
router.post('/create-session' , 
passport.authenticate(  // passport will authenticate the sign in request 
    'local' , 
    {failureRedirect : "/users/sign-in"}
),usersController.createSession);


router.get('/sign-out' , usersController.destroySession);

module.exports = router;