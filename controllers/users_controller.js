const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const Friendship = require('../models/friendship');
const commentsMailer = require('../mailers/comments_mailer');


module.exports.profile = async function(req , res){
    let friendship1 = await Friendship.find({
        from_user: req.user.id,
        to_user: req.params.id,
    });


    let friendship2 = await Friendship.find({  // find({}) returns the corresponding object in the list so lenght of list need to be 1
        from_user: req.params.id,
        to_user: req.user.id,
    });

    let isFriend = false;
    if (friendship1.length > 0 || friendship2.length > 0 ) {  
      isFriend = true;
    }


    let user = await User.findById(req.params.id)
    console.log('isFriend -', isFriend , ', profile_user is  -'+ user.name);
    return res.render("user_profile" , {
        title : 'Profile : '+ user.name,
        profile_user : user,    
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


// for localhost/user/sign-in  , this action is taken (to display sign in page)
module.exports.signIn = function(req,res){
    if(req.isAuthenticated()){
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_in' , {
        title : 'Codeial | Sign In'
    })
}   




// action to handle post request made by user by filling the form in user_sign_up page :->
module.exports.create = function(req, res){
    // console.log(req.body.password , req.body.confirm_password);
    if(req.body.password != req.body.confirm_password){
        return res.redirect('back');  // back to sign up page
    }

    User.findOne({email : req.body.email})
    .then((user)=>{  
        if(!user){    
            User.create(req.body)
            .then((user)=>{
                // console.log(`${new_user} is added in User collection`); 
                return res.redirect('/users/sign-in');  // if you redirect to sign-in page i.e user is created in database
            })
            .catch((err)=>{
                console.log('Error in creating the user while signing up');
                return ;
            })
        } else{   // if user with given email already exist then redirect back to sign up page
            return res.redirect('back');
        }
    })
    .catch((err)=>{
        console.log('Error in finding the user while signing up');
        return;
    })

};



// action to handle post request made by user by filling the form in user_sign_in page  :->
module.exports.createSession = function(req, res){
    req.flash('success' , "Logged In Successfully");
    // console.log('a1' ,  "Logged In Successfully");
    return res.redirect('/');  
};


module.exports.destroySession = function(req , res){
    
    req.logout(function(err) {  // req.logout() is now an asynchronous function, whereas previously it was synchronous
        if (err) { return next(err); }
        req.flash('success' , "You have logged out !");
        // console.log('a2' ,   "You have logged out !");
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
        commentsMailer.resetPasswordEmail(user);
        req.flash('success' , "mail is delieverd , check your email!");
        return res.redirect('back');
    }else{
        req.flash('success' , "user with this email does not exists, enter valid email!");
        return res.redirect('back');
    }
}

module.exports.resetPass = async function(req , res){
    return res.render('reset_password',{
        title: 'reset password',
        username : req.params.user_name,
        useremail : req.params.user_email
    });
}

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
        commentsMailer.passwordResetSuccessfullyEmail(user);
        return res.render('user_sign_in',{
            title : 'Codeial | Sign In'
        });
    }
}


