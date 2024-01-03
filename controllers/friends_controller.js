const Users = require("../models/user");
const Friendships = require("../models/friendship");
const commentsMailer = require('../mailers/comments_mailer');
const Token = require('../models/token');
const crypto = require('crypto');
const User = require('../models/user');
module.exports.addFriend = async function(request , response){   

    try {

            let deleted = false;
           
            let fromUser = await Users.findById(request.user);
            let toUser = await Users.findById(request.query.id);
            
            let existingFriendship = await Friendships.findOne({
                from_user : request.user,
                to_user : request.query.id,
            });
            
            //special case :- friendship request is from request.query.id(user in friends list) to request.user(signed in user)
            if(!existingFriendship){  // if existingFriendship is undefined their is still chance that friendship exists but from query.id to user(signed in user)  else even clicking on remove friendship it will not remove it
                existingFriendship = await Friendships.findOne({
                    from_user : request.query.id,
                    to_user : request.user,  
                });
            }   
        
            if(existingFriendship){
                toUser.friendships.pull(existingFriendship._id);
                fromUser.friendships.pull(existingFriendship._id);
                existingFriendship.deleteOne();  // this will remove existingFriendship from colletion or await await Friendships.deleteOne(existingFriendship);
                deleted = true;

        // in addFriend action :- if in case if friend is deleted from friends list then also delete it from close friends list if he is present in close friends list
                const istoUserInCloseFriendsOfFromUser = fromUser.closeFriends.some( (closeFriend) => closeFriend._id.equals(toUser._id) );   
                const isFromUserInCloseFriendsOftoUser = toUser.closeFriends.some( (closeFriend) => closeFriend._id.equals(fromUser._id) );

                if(istoUserInCloseFriendsOfFromUser && isFromUserInCloseFriendsOftoUser){  
                    fromUser.closeFriends = fromUser.closeFriends.filter(
                        (closeFriend) => !closeFriend._id.equals(toUser._id)
                    );
                    toUser.closeFriends = toUser.closeFriends.filter(
                        (closeFriend) => !closeFriend._id.equals(fromUser._id)
                    );
                    request.flash('success', 'Close Friend Removed!');
                }
                else if(istoUserInCloseFriendsOfFromUser){
                    fromUser.closeFriends = fromUser.closeFriends.filter(
                        (closeFriend) => !closeFriend._id.equals(toUser._id)
                    ); 
                    request.flash('success', 'Close Friend Removed!');
                }
                else if(isFromUserInCloseFriendsOftoUser){  // can't do else if
                    toUser.closeFriends = toUser.closeFriends.filter(
                        (closeFriend) => !closeFriend._id.equals(fromUser._id)
                    );
                    request.flash('success', 'Close Friend Removed!');
                } // ,Error : ParallelSaveError: Can't save() the same doc multiple times in parallel. occurs if saving twice , remove save if you are saving multiple times

                await fromUser.save();  // save updated fromUser & toUSer
                await toUser.save();

                request.flash('success', 'Friend Removed!');
            }else{

                // Generating new token and storing it in DB
                const randomToken = crypto.randomBytes(20);//.toString('hex')
                let token  = await Token.create({
                access_token: randomToken,
                });    
                commentsMailer.addFriendEmail(fromUser ,toUser,token); // calling mailer here
                token.fromUser = fromUser;   // ******NOTE:- after sending token to email , i updated token & added fromUser init token with fromUSer field not creating any link for anchor tags in email(may need to use token filter)
                await token.save();
                toUser.pendingFriendshipRequests.push(token);  // *****    
                toUser.save();
                // console.log("Total Friendship requests received by toUser",toUser.pendingFriendshipRequests.length);  // always 1

                friendship = await Friendships.create({  // create fun. creates object 'friendship' of collection Friendships & also adds this object into the collection
                    to_user : toUser.id,
                    from_user : fromUser._id,
                    status :-1,    
                    closeFriendStatus_fromUser_to_toUser:0,
                    closeFriendStatus_toUser_to_fromUser:0 // // you have to define this at the time of object creation else default value will not be zero 
                });       
                // not adding friendship in friendships list of toUser and fromUser cause status is request sent/pending(-1)
            }
            if(request.xhr){
                return response.status(200).json({    
                    message : "Request Successful",
                    data:{
                        deleted : deleted
                    } 
                });
            }

            if(deleted){
                request.flash('success', 'Friend Removed!');
            }else{
                request.flash('success', 'Friend Added!');
            }
            return response.redirect("back");


    } catch (error) {
        console.log(error);
        return response.json(500, {
            message: 'Internal Server Errorrrr'
        });
    }

}



module.exports.addFriendResponse = async function(request , response){

try {
    let { request_query } = request.query
    let token = await Token.findOne({ token: { $eq: request_query } }) // ********findOne(request.query.token) not works
    // console.log('token',token);    
    if(token==null){
        request.flash('error','cannot perform this action again');  // token is null & not exist in Token collection (**link is expired cause you already clicked on it)
        return response.redirect('/');    
    }
    // console.log("request.isAuthenticated()",request.isAuthenticated());

    response.cookie('fromEmail' ,request.query.from_user);  
    response.cookie('toEmail' ,request.query.to_user); // this is stored in cookie , no need to send this values to different pages through a request.qyery or params 
    response.cookie('value' ,request.query.value); // stored on cookie to access this things on any page of server
    // console.log(request.cookies.fromEmail);
    // console.log(request.cookies.toEmail);
    // console.log(request.cookies.value); // *********cookies are undefined still , when we make call to same action then it will contain value ; we are doing this cause after creating or updating cookie it will not get updated immediately so need to make one more call to same action
    if(!request.isAuthenticated()){   
        request.flash('error','Please Sign-In First');
        return response.redirect('/users/sign-in/');    // sign in further call to this same action 
    }
    if(request.cookies.fromEmail == undefined){  // calling to same action again so cookies will get values
        return response.redirect('/friends/add-friend-response/');
    } //*******/ no need to send queries as they are already in cookies(but token is not in cookie & not sent from here still working?)
    let fromUser = await Users.findOne({email:request.cookies.fromEmail});
    let toUser = await Users.findOne({email:request.cookies.toEmail});
    let friendship = await Friendships.findOne({  
        to_user : toUser.id,  
        from_user : fromUser._id,
        status :-1,
    }/*,{$set :{'status':1}} , {new:true}*/);  // findOneAndUpdate => 2 more arguments :-{$set :{'status':1}} , {new:true}    
    // console.log('request.cookies.value',request.cookies.value,request.query.value,typeof(request.cookies.value))  
    // once you accept request for very first time then if later he reject that from same link even though value will remain true only
    if(request.cookies.value==="true"){       
        // if (friendship == null){  // NO ANY NEED cause we using token so program not reaches here
        //     request.flash('error', "can't perform this action again");   
        //     return response.redirect('/');   
        //     // friendship == null cause :-
        //     //1) toUser & fromUser both are already friends so in their friendships array(of both) the updated
        //     //friendship object is there (with status=1 & not -1) but when toUser 2nd time clicks on anchor tag of accept in email
        //     //the friendship is null cause staus is already updated to 1 so friendship with status -1 not exist now  
        //     //2) toUser already rejected friend request so friendship object is already removed from collection.
        // }
    
        friendship.status = 1; // updateOne not working hence updated in this way 
        await friendship.save();  // updated friendship gets saved in collection
        toUser.friendships.push(friendship);  // by default it stores id of friendship or you can do friendship.id 
        fromUser.friendships.push(friendship);                  
        fromUser.save();         
        request.flash('success', fromUser.name ,'is added to you friend list!');    
    }
    else{
        // if (friendship == null){ // friendship is already removed so can't reject/accept for second time
        //     request.flash('error', "can't perform this action again"); 
        //     return response.redirect('/');
        // }
        await Friendships.deleteOne(friendship)    // friendship is null now ; no need of friendship.status = 0; 
        // friendship obj. initially added in collection Friendships at the time when fromUser made friend request to toUser is deleted now
        request.flash('success', 'Friend Request is rejected!');   
    }
    // response.cookie('fromEmail' , null); // instead of removing the fromEmail key from cookie reset it to null
    response.clearCookie("fromEmail");
    response.clearCookie("toEmail");
    response.clearCookie("value");


    let path_to_redirect = '/';
    if(token.fromUser){
        path_to_redirect = 'back' // /users/pending-friend-requests/?email=<%=request.body.email%>  this is path of page which displayes friend requests 
    }
    let deletedToken=await Token.deleteOne(token)  // deletedToken is undefined 
    .then((data)=>{console.log(data)});    // token is deleted after very first action so can't click on accept/reject anchor tag in mail for 2nd time.  

    toUser.pendingFriendshipRequests.pull(token); // *****
    await toUser.save();  //     add await else ParallelSaveError error or save is not a function if saving above & again saving here
    
    return response.redirect(path_to_redirect) ;    
    } catch (error) {
        console.log(error);
        // return response.json(500, {
        //     message: 'Internal Server Errorrrr'
        // });
        return response.redirect('/');
    }                      
}      


module.exports.closeFriends = async function(request,response){
    console.log('request.user._id',request.user._id);
    let current_user;
    if (request.user){
        current_user = await User.findById(request.user._id)
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
        })
        .populate({    
            path: "friendships",             
            populate: {   
              path: 'closeFriendStatus_toUser_to_fromUser',
            }
          })
        .populate({    
            path: "friendships",             
            populate: {   
              path: 'closeFriendStatus_fromUser_to_toUser',
            }
          })
        .populate('closeFriends')};     
    return response.render('close_friends.ejs',{
        title:'Your Close Friends List',
        all_friends : current_user.friendships,
        all_close_friends : current_user.closeFriends
    })
}


module.exports.addOrRemoveCloseFriend = async function(request,response){
    try {
        let closeFriendDeleted=0; // not used true & false cause it is used in addFriend action & toggle_friend.js is same for both this actions 
        let current_user = await User.findById(request.user._id).populate('closeFriends').populate('friendships');
        let friend = await User.findById(request.query.close_friend_id);

        let friendship1 = await Friendships.findOne({  // same in user profile action
            from_user: current_user.id,
            to_user: friend.id,
        });
        let friendship2 = await Friendships.findOne({ 
            from_user: friend.id,  
            to_user: current_user.id,
        });
        let friendship_object;
        if(friendship1!=null){
            friendship_object = friendship1;
        }else{
            friendship_object = friendship2;
        }

        // check friend is in close friend list of current_user
        const isFriendInCloseFriends = current_user.closeFriends.some(  // can't use current_user.closeFriends.indexOf(friend); ; indexOf can't compares objects & gives -1 always
        (closeFriend) => closeFriend._id.equals(friend._id)
        );

        const friendshipIndex1 = current_user.friendships.findIndex((friendship) =>friendship.equals(friendship_object));  
        // friendshipIndex1 is -1 if the friend is not in the closefriends list of current_user  // to directly find friendship object you can use find()
        const friendshipIndex2 = friend.friendships.findIndex((friendship) =>friendship.equals(friendship_object)); 
        
        const friendship = current_user.friendships[friendshipIndex1];
        
         // first remove already existing friendship object from both the friendships array of current_user & his friend
        current_user.friendships.splice(friendshipIndex1, 1);
        friend.friendships.splice(friendshipIndex2, 1);
        if (!isFriendInCloseFriends) {
            current_user.closeFriends.push(friend.id);
            if(current_user._id.toString()==friendship.to_user.toString()){  // friendship.to_user is a buffer ckeck it's type
                friendship.closeFriendStatus_toUser_to_fromUser= 1;
            }else{
                friendship.closeFriendStatus_fromUser_to_toUser= 1;
            }
            console.log('Friend is not in close friends list so added it in to Close Friends List');
        } else { // isFriendInCloseFriends = true  
            current_user.closeFriends = current_user.closeFriends.filter( (closeFriend) => !closeFriend._id.equals(friend._id) );
            if(current_user._id.toString()==friendship.to_user.toString()){
                friendship.closeFriendStatus_toUser_to_fromUser= 0;
            }else{
                friendship.closeFriendStatus_fromUser_to_toUser= 0;
            }
            closeFriendDeleted=1; 
            console.log('Friend was already in close friend list so deleted from Close Friends List');
        }
        current_user.friendships.push(friendship);   
        friend.friendships.push(friendship);  // new object is pushed in arrays
        await friendship.save();  // this updates object in colletion
        await current_user.save(); 

        if(request.xhr){  
            return response.status(200).json({    
                message : "Request Successful",
                data:{
                    closeFriendDeleted : closeFriendDeleted   // giving response to toggle.js
                } 
            });
        }
        return response.redirect('/');
    } catch (error) {
        console.log(error);
        return response.redirect('/');
    }
}   