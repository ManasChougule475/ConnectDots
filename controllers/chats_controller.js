const Chats = require('../models/message');
const User = require('../models/user');
// const { all } = require('../routes/chats');      

module.exports.getPreviousMessages =  async function(req,res){ // not wrtting code in home_controller and user profile action cause we send only one response
   
    try {
        // Fetch messages from the database
        var profile_user = undefined;
        var messages;
        var size=0;
        var all_messages = undefined;
        if(req.params.to_user!='null'){
            messages =  new Array(10);
            size=10;
            profile_user =  await User.findOne({email:req.params.to_user});
            // console.log("profile_user",profile_user,req.params.to_user);  
            all_messages = await Chats.find({ 
                $or: [
                    { user_email: req.user.email, to_user: profile_user.email },
                    { user_email: profile_user.email, to_user: req.user.email }
                ]
            });  // filtering data at server side only

            // all_messages = await Chats.find({
            //     $or: [
            //       { user_email: { $in: [req.user.email, profile_user.email] }, to_user: { $in: [req.user.email, profile_user.email] } }
            //     ]
            //   });


        }else{
            messages =  new Array(20);
            size=20;
            all_messages = await Chats.find({to_user:null}).exec(); //  all_messages is a list 
        }


        // Deleting outdated chats from collection only showing recent 10 or 20 chats
        let key, objectLenght = 0;
        objectLenght=Object.keys(all_messages).length;
        console.log('{{{',objectLenght,size)
        if((objectLenght-size)>0){
            console.log('>>>>>');
            for(let i=0;i<objectLenght-size;i++){
                await Chats.deleteOne(all_messages[i]);
                // return res.redirect(`/chat/getPreviousMessages/${req.params.to_user}/`);
                // no need to reload page twice by user as u r displaying all_messages[i+(objectLenght-size)]
            }
            for(let i = 0; i<size;i++){
                messages[i] = all_messages[i+(objectLenght-size)];
            }
        }else{
            console.log('<<<<<');
            for(let i = 0; i<objectLenght;i++){
                messages[i] = all_messages[i];
                // messages.splice(i, 0, all_messages[i])
            }   
        }

        res.json({ messages });
       
    } catch (error) {
        console.error('Error fetching previous messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}