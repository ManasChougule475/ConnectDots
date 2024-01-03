const User = require('../models/user');
const Post = require('../models/post');
const fs = require('fs');          
const path = require('path');
const Friendship = require('../models/friendship');
const commentsMailer = require('../mailers/comments_mailer');
const Token = require('../models/token');
const crypto = require('crypto');
const passport = require('passport');
const Chats = require('../models/message');

module.exports.profile = async function(req , res){
    let friendship1 = await Friendship.find({
        from_user: req.user.id,
        to_user: req.params.id,
    });


    let friendship2 = await Friendship.find({  // find({}) returns the corresponding object & that object is present in list so lenght of list need to be 1
        from_user: req.params.id,
        to_user: req.user.id,
    });

    let isFriend = 0;
    if (friendship1.length > 0 || friendship2.length > 0 ) {  // this becomes true if friendship bw toUser & fromUser alsready exists as well as
      isFriend = 1; // in case of pending request also friendhship bw fromUser & toUser exist in collection (but not in their friendships array)
    }            
    if(isFriend){ // if isFriend == 1
        // console.log(Object.keys(friendship1));
        if ((friendship1[0] != undefined && friendship1['0'].status == -1) || (friendship2['0'] != undefined && friendship2['0'].status== -1)){
            isFriend = -1  // request to connect is sent and it is pending
        }
        console.log('isFriend' , isFriend , typeof(friendship1),friendship1); 
    }
                  
    
    // this part of populating profile user is added 
    // from home_controller.   
    // req.params.id is id of profile user
    let profile_user = await User.findById(req.params.id) 
    .populate({
        path: 'friendships',
        populate: {
            path: 'from_user'
        }
    })
    .populate({
        path: "friendships",             
        populate: {
        path: 'to_user',
        }
    });

    // posts of profile_user
    let posts = await Post.find({user:req.params.id}) 
    .sort('-createAt')
    .populate('user')
    .populate({
        path : 'comments' ,
        populate : {
            path : 'user'  
        }
    })
    .populate({
        path : 'comments',
        populate : {
            path : 'likes' 
        }
    })
    .populate('likes');  



    // if(profile_user){
    //     const messages = await Chats.find({user_email:profile_user.email}).exec();
    // }else{
    //     const messages = await Chats.find().exec();   
    // }
    // res.json({ messages });


    // console.log('isFriend -', isFriend , ', profile_user is  -'+ profile_user.name);
    return res.render("user_profile" , {
        title : 'Profile : '+ profile_user.name,
        friends_list :profile_user.friendships,// typeof(user.friendships):-object ;this are friends of profile_user
        posts :posts, // posts of profile user
        profile_user : profile_user,    
        isFriend : isFriend
    })

}



module.exports.update = async function(req, res){
    // if(req.user.id == req.params.id){
    //     User.findByIdAndUpdate(req.params.id, req.body)
    //     .then((user)=>{
    //         return res.redirect('back');
    //     })
    // }else{
    //     return res.status(401).send('Unauthorized');
    // }

    if(req.user.id == req.params.id){     
        try {
            let user = await User.findById(req.params.id);
            User.uploadedAvatar(req,res,function(err){ // multer processes the request on calling this function 
                if(err){console.log('*****Multer Error' , err);}
                //console.log(req.file);
                user.name = req.body.name;
                user.email = req.body.email;   // upadted the user
                if(req.file){
                    
                    if(user.avatar && fs.existsSync(path.join(__dirname,'..',user.avatar))){
                        fs.unlinkSync(path.join(__dirname,'..',user.avatar));
                    } 
                    
                    user.avatar =  User.avatarPath + '/' + req.file.filename;
                } // upadted the user avatar
                user.save(); 
                return res.redirect('back');
            })

        } catch (error) {
            req.flash('error' , error);
            return res.redirect('back');
        }
    }else{
        return res.status(401).send('Unauthorized');
    }
}



// for localhost/user/sign-up  , this action is taken (to display/render sign up page)
module.exports.signUp = function(req,res){
    if(req.isAuthenticated()){
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_up' , {
        title : 'Codeial | Sign Up'
    })
}


// for localhost/user/sign-in  , this action is taken to display sign in page
module.exports.signIn = function(req,res){
    console.log('signIn');
    if(req.isAuthenticated()){
        return res.redirect('/users/profile');
    }
    // console.log(req.cookies.fromEmail, req.cookies.toEmail , req.cookies);  
    return res.render('user_sign_in' , {
        title : 'Codeial | Sign In' 
    })
} 




// action to handle post request made by user by filling the form in user_sign_up page :->
module.exports.create = function(req, res){

    if(req.body.password != req.body.confirm_password){
        return res.redirect('back');  // back to sign up page
    }
    User.findOne({email : req.body.email})
    .then((user)=>{  
        if(!user){     
            User.create(req.body) // no need to add isEmailVerified=false as already set it default as false in user model
            .then((user)=>{
                // // console.log(`${new_user} is added in User collection`); 
                // return res.redirect('/users/sign-in');  // now as verification process is added so commented this code


                // once user submit's sign up form user is created in db & now sending email address verifaction link to mail of user  
                const randomToken = crypto.randomBytes(20).toString('hex');
                let token  =  Token.create({
                access_token: randomToken,
                });

                commentsMailer.verifyEmailAddress(user,token);

                return res.render('verification_email_delievered' , {
                    title : 'Codeial | Email Verification',
                    email :  req.body.email
                });

            })
            .catch((err)=>{
                console.log('Error in creating the user while signing up',err);
                return ;
            })
        } else{   // if user with given email already exists then redirect back to sign in page
            return res.redirect('/users/sign-in');
        }
    })
    .catch((err)=>{
        console.log('Error in finding the user while signing up' , err);
        return;
    })

};



// action to handle post request made by user by filling the form in user_sign_in page  :->   
//user submits sign in form ->  passport.authenticate() is called which authenticates user(i.e checks credentials :- email & password given in sign in)
//so req.isAuthenticated() will become true -> createSession is called ->if user email is not verified then user gets logged out & req.isAuthenticated() will become false
module.exports.createSession = function(req,res,next){   
    if(!req.user.isEmailVerified){  
        console.log('inn0');
        console.log('req.isAuthenticated()',req.isAuthenticated());  // true , cause user signed in 
        req.logout(function(err) {  
            console.log('inn1');    
            console.log('req.isAuthenticated() in req.logout()',req.isAuthenticated()); // false , cause user logouts 
            if (err) { return next(err); }
            console.log('inn2');
            return res.render('send_verification_email.ejs',{
                title : 'Send Verification Email',
                email:req.body.email
            });
        });   // user gets logged out now so req.isAuthenticated() is false now & req.user is null (req.user was set by passport.serializeUser after sign in) 
    }        
    console.log('inn3');
    // console.log('fromEmail in sign in',req.cookies.fromEmail , req.cookies.fromEmail!='j:null')
    if(req.cookies.fromEmail && req.cookies.toEmail == req.body.email){  // when fromUser sends connect request to toUSer , toUser need to sign in with his own email then only this request is accepted/rejected
        console.log("req.isAuthenticated() in sign in",req.isAuthenticated());  // req.cookies.fromEmail!='j:null' in case if cookie is replaced
        return res.redirect('/friends/add-friend-response/');   // with this notification is not visible to fromUser(toUser & fromUser both are using same device)
    }       
    console.log('inn4');
    if(req.user){  
        req.flash('success' , "Logged In Successfully");
        return res.redirect('/'); 
    } // return res.redirect('/'); // Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    // this error is cause of above line ,return res.redirect('/'); 
// req.logout() is an asynchronous function and will execute when createSession action ends but at end of these action there is these line :- return res.redirect('/');
    // & in req.logout() it is rendering send_verification_email.ejs so redirecting twice hence these error occured
    // hence redirect to home('/') only if user's email is verified i.e if req.user.isEmailVerified
    // but once req.logout() executes user gets logged out & req.user becomes null 
    // so if you write if(req.userisEmailVerified){ return res.redirect('/'); } it will give error :- can't read property of null
    // but user's email is already an verified email then req.logout() will not execute ;  hence user is not signed out , hence req.user will not become null 
    // hence condition will be if(req.userisEmailVerified){ return res.redirect('/'); }
};


module.exports.destroySession = function(req , res){
    
    req.logout(function(err) {  // req.logout() is now an asynchronous function, whereas previously it was synchronous
        if (err) { return next(err); }
        req.flash('success' , "You have logged out !");
        // console.log('a2' ,   "You have logged out !");
        console.log("request.isAuthenticated() after logout",req.isAuthenticated())
        return res.redirect('/');
      });
}


// forgot password
module.exports.forgotPass = function(req , res){
    return res.render('enter_email',{
        title : 'enter email'
    });
}

module.exports.verifyEmail = async function(req , res){
    let user = await  User.findOne({email : req.body.email});
    if(user){
        const randomToken = crypto.randomBytes(20).toString('hex');
        let token  = await Token.create({
        access_token: randomToken,
        });   
        commentsMailer.resetPasswordEmail(user,token);
        req.flash('success' , "mail is delieverd , check your email!");
        return res.redirect('back');
    }else{
        req.flash('success' , "user with this email does not exists, enter valid email!");
        return res.redirect('back');
    }
}


//router.get('/reset-password/:user_name/:user_email/:token' , usersController.resetPass);
module.exports.resetPass = async function(req , res){
    let { request_params } = req.params
    let token = await Token.findOne({ token: { $eq: request_params } })
    if(token==null){
        req.flash('error', "can't perform this action again"); 
        return res.redirect('/users/sign-in');
    }
    console.log('tokennnn:-',token);
    return res.render('reset_password',{
        title: 'reset password',
        username : req.params.user_name,
        useremail : req.params.user_email,
        token:req.params.token,
    });
}



// router.post('/change-password/:user_email/:token' , usersController.changePass);
module.exports.changePass = async function(req , res){
    if(req.body.new_password != req.body.confirm_password){
        req.flash('error' , "Passwords didn't match");
        return res.redirect('back');
    }else{
        let user = await User.findOne({email: req.params.user_email});
        if (!user) {
            req.flash('error', 'Invalid request');
            return res.redirect('back');
        }
        user.password = req.body.new_password;
        user.save();   
        req.flash('success' , "Password reset successfully");

        let { request_params } = req.params;
        let token = await Token.findOne({ token: { $eq: request_params } })
        let deleted=await Token.deleteOne(token)  // delete token from database
        .then((data)=>{console.log(data)}); 
        token = await Token.findOne({ token: { $eq: request_params } })
        console.log('token deleted',token)
        // console.log('deleted',deleted);
        // token = await Token.findOne({ token: { $eq: request_params } })
        // console.log('token after deleting',token);
        commentsMailer.passwordResetSuccessfullyEmail(user);
        return res.render('user_sign_in',{
            title : 'Codeial | Sign In'
        });
    }     
}




// displaying friendship requests
module.exports.friendRequests = async function(req , res){
    let user = await User.findOne(req.user._id)
    .populate({ 
        path: "pendingFriendshipRequests",             
        populate: {
          path: 'fromUser',    
        }
    })
    .populate({
        path: "pendingFriendshipRequests",             
        populate: {
          path: 'access_token',
        }
    });         
    let pendingFriendshipRequests;
    pendingFriendshipRequests = user.pendingFriendshipRequests;           
    return res.render("friend_requests",{
        title:'Friend Requests',
        pendingFriendshipRequests : pendingFriendshipRequests
    })

}



// this action gets called for email verification , when user sign ups  then a confirmation/verification email is delivered to his mail 
// then user clicks on the link 'verify my email' after that to verify his email this action gets called 
// (if user never clicks on this link delivered in mail & tries to sign in then again verification email is delievered to him)
// router.get('/verify-my-email-address/:user_email/:token',usersController.verifyMyEmailAddress);
module.exports.verifyMyEmailAddress = async function(req,res){
    let { request_params } = req.params;
    let token = await Token.findOne({ token: { $eq: request_params } })
    if(token==null){
        req.flash('error', "can't perform this action again"); 
        return res.redirect('/users/sign-in');
    }
    let dele=await Token.deleteOne(token)  


    let user = await User.findOne({email: req.params.user_email});
    if (!user) {
        req.flash('error', 'Invalid request');
        return res.redirect('back');
    }

    user.isEmailVerified = true;  // *********email is verified now**********
    user.save();
   
    console.log('Email is verified successfully, sign in now');

    req.flash('success', 'Email is verified successfully, sign in now');
    // return res.render('user_sign_in' , {  // if you tries to render then it will not show flash message hence redirecting
    //     title : 'Codeial | Sign In'  ,         
    // })
    commentsMailer.accountActivated(user);  // email verified & account activated 
    res.redirect('/users/sign-in');

}

// this action is called when user sign ups(registers) but never verifies his email & then tries to login
// at that time to again send the verification/confirmation email to the user this action gets called.
// router.get('/send-verification-email/:user_email/',usersController.sendVerificationEmail);
module.exports.sendVerificationEmail = async function(req,res){
    let user = await User.findOne({ email: req.params.user_email });

    if (user) {
        const randomToken = crypto.randomBytes(20).toString('hex');
        let token = Token.create({
            access_token: randomToken,
        });
        commentsMailer.verifyEmailAddress(user, token); 
    // this will send mail again -> if user clicks on "verify my email" link delievered in mail then :- verifyMyEmailAddress action will further verifies user's email 
    // so account gets activated 
        return res.render('verification_email_delievered' , {
            title : 'Codeial | Email Verification',
            email :  req.params.user_email
        });

    } else {
        console.error('User not found with email: ' + req.params.user_email);
        return res.redirect('/users/sign-in');
    }
}



  
  