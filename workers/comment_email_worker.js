const queue = require('../config/kue');
// different workers can also run on same queue but here just one worker is used to run on queue 
//(for each job create separate worker so that code remains clean)
const commentsMailer = require('../mailers/comments_mailer');        

queue.process('emails' , function(job , done){
    // console.log('emails worker is processing a job' , job.data);
    commentsMailer.newComment(job.data);
    done();
})         