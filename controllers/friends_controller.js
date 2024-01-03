const Users = require("../models/user");
const Friendships = require("../models/friendship");



module.exports.addFriend = async function(request , response){   

    try {

            let deleted = false;
        
            let toUser = await Users.findById(request.user);
            let fromUser = await Users.findById(request.query.id);
        
            
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
                toUser.save();
                fromUser.save();
                existingFriendship.deleteOne();
                deleted = true;
                // request.flash('success', 'Friend Removed!');
            }else{
                let friendship = await Friendships.create({
                    to_user : request.query.id,
                    from_user : request.user._id
                });
            
                toUser.friendships.push(friendship);
                if(request.user._id != request.query.id){  // if request.user(signed in user) & request.query.id both are same then it will add user two times in friend list so added check 
                    fromUser.friendships.push(friendship);  
                } 
                toUser.save();
                fromUser.save();
                // request.flash('success', 'Friend Added!');
            }
            // console.log(deleted);
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