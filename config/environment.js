const fs = require('fs');
const rfs = require('rotating-file-stream');   
const path = require('path');

   
const logDirectory = path.join(__dirname, '../production_logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = rfs.createStream('access.log', {  // use createStream else TypeError: rfs is not a function 
    interval: '1d',
    path: logDirectory      
});


const development = {
    name: 'development',
    asset_path: './assets',  // when you remove dot or do /public/assets it gives error
    session_cookie_key: 'blahsomething',
    db: 'db_name',
    smtp : {   
        service: 'gmail',
        host: 'smtp.gmail.com', // google gmail smtp settings
        // port: 587, // Transport Layer Security
        // secure: false, // not going to use 2 factor authentication
        // auth: { // to establish identity with which you sendung the email(if you are bulk use they can charge you , if you spam then can block you)
        //         // with api you can send almost 500 emails per day
        //     user: 'manaschougule2019@gmail.com',
        //     pass: 'eatgzsvmkfthotaz' // Error: Invalid login: Application-specific password required - 
        //     //If you have enabled 2-factor authentication on your Google account you can't use your regular password to access Gmail programmatically. You need to generate an app-specific password and use that in place of your actual password.
        // }

        port : 465,
        secure:true,
        auth:{
            user: 'manaschougule2019@gmail.com',
            pass: 'iokl jyqt wpmh slmj'
        },   
    },
    google_client_id: '86293826903-47rjjh5d38ebeoul5gl368f2o5dcfqnc.apps.googleusercontent.com',   
    google_client_secret: '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', 
    google_callback_url: "http://13.127.17.176:8000/users/auth/google/callback",
    jwt_secret_key: 'codeial_jwt_secret',
    morgan: {
        mode: 'combined',
        options: {stream: accessLogStream}
    },
}



const production={
    name: 'production',
    asset_path: process.env.CODEIAL_ASSET_PATH,
    session_cookie_key: process.env.CODEIAL_SESSION_COOKIE_KEY,
    db: process.env.CODEIAL_DB,
    smtp: {        
        service: 'gmail',
        host: 'smtp.gmail.com',
        // port: 587,
        // secure: false,
        // auth: {
        //     user: process.env.CODEIAL_GMAIL_USERNAME,
        //     pass: process.env.CODEIAL_GMAIL_PASSWORD
        // }

        port : 465,
        secure:true,
        auth:{
            user: process.env.CODEIAL_GMAIL_USERNAME,
            pass: process.env.CODEIAL_GMAIL_PASSWORD
        },

    },   
    google_client_id: process.env.CODEIAL_GOOGLE_CLIENT_ID,
    google_client_secret: process.env.CODEIAL_GOOGLE_CLIENT_SECRET,
    google_call_back_url: process.env.CODEIAL_GOOGLE_CALLBACK_URL,
    jwt_secret: process.env.CODEIAL_JWT_SECRET,    
    morgan: {
        mode: 'combined',  
        options: {stream: accessLogStream}
    },
    twilio_sid : process.env.TWILIO_ACCOUNT_SID,
    twilio_auth_token : process.env.TWILIO_AUTH_TOKEN,
    twilio_phone_number : process.env.TWILIO_PHONE_NUMBER
}

module.exports = eval(process.env.CODEIAL_ENVIRONMENT) == undefined ? development : eval(process.env.CODEIAL_ENVIRONMENT);
