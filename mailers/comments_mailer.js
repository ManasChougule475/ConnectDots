
// whenever new comment is made just need to call this mailer to send the email to the user to makes the comment



const nodeMailer = require('../config/nodemailer');

// newComment = function();
// module.exports = newComment; instead :-
// this is another way of exporting a method -

// exports.newComment = (comment) => {
//     let htmlString = nodeMailer.renderTemplate({comment: comment}, '/comments/new_comment.ejs');

//     nodeMailer.transporter.sendMail({
//        from: 'manaschougule2019@gmail.com',
//        to: [comment.user.email],   
//        subject:"You Have Published A New Comment!!",
//     //    html: htmlString
//         html: '<h1>Yup , Your Comment Is Now Published </h1>'
//     }, (err, info) => {  // info : info about request that has been sent
//         if (err){
//             console.log('Error in sending mail', err);
//             return;
//         }
//         // console.log('Maile Delieverd sent', Info);
//         console.log('Maile Delieverd', comment.content);
//         return;
//     });
// }



exports.newComment = (object , comment_content) => {
    let htmlString;
    let sub;  
    if(object.post){  // comment_content will be empty in this case (not sending)
        htmlString = nodeMailer.renderTemplate({comment: object}, '/comments/new_comment.ejs');
        sub = "You Have Published A New Comment!"
    }else{
        htmlString = nodeMailer.renderTemplate({post: object , comment_content:comment_content }, '/posts/new_post.ejs');
        sub = "New Comment Published On Your Post!"
    }

    nodeMailer.transporter.sendMail({ 
        from: 'manaschougule2019@gmail.com',
        to: object.user.email ,   
        subject: sub,
        html: htmlString
    }, (err, info) => {  // info : info about request that has been sent
        if (err){
            console.log('Error in sending mail', err);    
            return;
        }
        console.log('Maile Delieverd sent', Info);
        console.log('Maile Delieverd', object.content);
        return;
    });  
}


exports.resetPasswordEmail = (user,token) => {
    user = {email: user.email ,name: user.name}; // instead of sending entire user just sending his name & email
    let htmlString = nodeMailer.renderTemplate({user: user,token:token}, '/passwords/reset_password_email.ejs');
    nodeMailer.transporter.sendMail({
       from: 'manaschougule2019@gmail.com',
       to: user.email,        
       subject:"Please reset your password",
        html: htmlString
    }, (err, info) => {  
        if (err){
            console.log('Error in sending mail', err);
            return;
        }
        return;
    });
}

exports.passwordResetSuccessfullyEmail = (user) => { 
    var user = {email: user.email ,name: user.name}; // instead of sending entire user just sending his name & email
    let htmlString = nodeMailer.renderTemplate({user: user}, '/passwords/reset_password_successfully_email.ejs');
    nodeMailer.transporter.sendMail({
       from: 'manaschougule2019@gmail.com',
       to: user.email,        
       subject:"Your password was reset",
        html: htmlString
    }, (err, info) => {  
        if (err){
            console.log('Error in sending mail', err);
            return;
        }
        return;
    });
}
    
                  
           
exports.addFriendEmail = (from_user , to_user , token)=>{ //  {email: this.email, name: this.name};
    var from_user = {email: from_user.email ,name: from_user.name,
        toString: function () {
            // return `email: ${this.email}, name: ${this.name}`;    
            return `${this.email}`;
            // return {email: this.email, name: this.name}
          },};
    var to_user = {email: to_user.email ,name: to_user.name,      
        toString: function () {     
            // return `email: ${this.email}, name: ${this.name}`;
            return `${this.email}`;
          },};    
        
    console.log("token ====>",token);
    let htmlString = nodeMailer.renderTemplate({from_user: from_user , to_user: to_user ,token:token}, '/friends/add_friend_email.ejs');
    nodeMailer.transporter.sendMail({
        from: from_user.email, 
        to: to_user.email,        
        subject:"I want to connect",
        html: htmlString
     }, (err, info) => {  
         if (err){
             console.log('Error in sending mail', err);
             return;
         }
         return;
     });
}



exports.verifyEmailAddress = (user,token) => { 
    var user = {email: user.email ,name: user.name}; 
    let htmlString = nodeMailer.renderTemplate({user:user, token:token}, '/emails/verify_email_address.ejs');
    nodeMailer.transporter.sendMail({
       from: 'manaschougule2019@gmail.com',
       to: user.email,        
       subject:"Codeial -Email Verification",
        html: htmlString
    }, (err, info) => {  
        if (err){
            console.log('Error in sending mail', err);
            return;
        }
        return;
    });
}

exports.accountActivated = (user) => { 
    var user = {email: user.email ,name: user.name}; 
    let htmlString = nodeMailer.renderTemplate({user:user}, '/emails/email_verified_successfully.ejs');
    nodeMailer.transporter.sendMail({
    from: 'manaschougule2019@gmail.com',
    to: user.email,        
    subject:"Codeial - Account Activated",
        html: htmlString
    }, (err, info) => {  
        if (err){
            console.log('Error in sending mail', err);
            return;
        }
        return;
    });
}


