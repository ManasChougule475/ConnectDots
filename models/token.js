const mongoose = require('mongoose');


const tokenSchema = new mongoose.Schema({
    access_token: {
        type: String,
        required: true
    },
    fromUser:{    // fromUser is not required : true cause in token in email has no fromUser(else link will not work) ;
        type: mongoose.Schema.Types.ObjectId,  // but token in pendingFriendshipRequests has fromUser to display info of fromUser in friend_requests.ejs page
        ref: 'User'
    },
    isvalid: {
        type: Boolean
    }
 
},{
    timestamps: true
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;