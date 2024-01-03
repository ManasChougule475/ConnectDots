const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path')
const env = require('./environment');

let transporter = nodemailer.createTransport(env.smtp); // this is the part which sends the email & defines communication


let renderTemplate = (data, relativePath) => {  //instead of this used arrow fun. ; relativePath is place from where this fun. is called
    let mailHTML; // to store html which has to send in the mail
    ejs.renderFile(
        path.join(__dirname, '../views/mailers', relativePath), // create mailer view to carry all the html email templates
        data,
        function(err, template){
         if (err){console.log('error in rendering template', err); return}
         
         mailHTML = template;
        }
    )

    return mailHTML;
} // whenevr i am going to send html email , the file will be placed in the /views/mailers


module.exports = {
    transporter: transporter,
    renderTemplate: renderTemplate
}