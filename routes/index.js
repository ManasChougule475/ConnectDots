const express = require('express');
const router = express.Router();
const env = require('../config/environment');
const homeController = require('../controllers/home_controller');
const jwt = require('jsonwebtoken');



function requireLogin(req, res, next) {
    if (req.user && req.user._id) {
        
        return next();
    } else {
        
        return res.redirect('/');
    }    
}

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.authToken;
    console.log('authenticateJWT',token)
    if (token) {
      jwt.verify(token, env.jwt_secret_key, (err, decoded) => {
        if (err) {
            console.log('env.jwt_secret_key',env.jwt_secret_key,'env.jwt_secret',env.jwt_secret,'err',err)
          return res.clearCookie('authToken').sendStatus(403); 
        }
        
        if(!req.isAuthenticated()){  
            
            req.customUser = decoded;
        }
        
        next();
      });   
    } else {
        
      next();
    }
  };

router.use(authenticateJWT);
router.get('/' , homeController.home);

router.use('/users' , require('./users'));



router.use(requireLogin);     
router.use('/posts' , require('./posts'));
router.use('/comments' , require('./comments'));
router.use('/likes' , require('./likes'));
router.use('/friends' , require('./friends'));

router.use('/api' , require('./api'));  




router.use('/chat',require('./chats')); 


router.get('*', (req, res) => {
    res.redirect('/');
});


module.exports = router;
  



