const User = require('../models/user');


module.exports.profile = function(req , res){
    // return res.end("<h1>Users Profile</h1>");
    return res.render("users" , {
        title : "Users"
    })
}



// for localhost/user/sign-up  , this action is taken (to display/render sign up page)
module.exports.signUp = function(req,res){
    return res.render('user_sign_up' , {
        title : 'Codeial | Sign Up'
    })
}


// for localhost/user/sign-ip  , this action is taken (to display sign in page)
module.exports.signIn = function(req,res){
    return res.render('user_sign_in' , {
        title : 'Codeial | Sign In'
    })
}




// action to handle post request made by user by filling the form in user_sign_up page :->
module.exports.create = function(req, res){
    console.log(req.body.password , req.body.confirm_password);
    if(req.body.password != req.body.confirm_password){
        return res.redirect('back');  // back to sign up page
    }

    User.findOne({email : req.body.email})
    .then((user)=>{  // findOne finds gives one "user" (but find() gives more than one "users")
        if(!user){    // if user with given email not exist then we will create that user(req.body) & add into User collection.
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
    
};




