
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


exports.resetPasswordEmail = (user) => {
    user = {email: user.email ,name: user.name}; // instead of sending entire user just sending his name & email
    let htmlString = nodeMailer.renderTemplate({user: user}, '/passwords/reset_password_email.ejs');
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
    user = {email: user.email ,name: user.name}; // instead of sending entire user just sending his name & email
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
                    