const Like = require("../models/like");
const Post =  require("../models/post");
const Comment = require('../models/comment');


module.exports.toggleLike = async function(req, res){
    try{

        // likes/toggle/?id=abcdef&type=Post
        let likeable;
        let deleted = false;

        // fetching the likeable(object on which like is made i.e post or comment) from the database
        if (req.query.type == 'Post'){
            likeable = await Post.findById(req.query.id).populate('likes');
        }else{
            likeable = await Comment.findById(req.query.id).populate('likes');
        }


        // check if a like already exists on clicked post or comment
        let existingLike = await Like.findOne({
            likeable: req.query.id,
            onModel: req.query.type,
            user: req.user._id
        })

        // if a like already exists then delete it
        if (existingLike){
            likeable.likes.pull(existingLike._id); // pull:- removing
            likeable.save();

            existingLike.deleteOne();
            deleted = true;

        }else{
            // else make a new like

            let newLike = await Like.create({
                user: req.user._id,
                likeable: req.query.id,
                onModel: req.query.type
            });

            likeable.likes.push(newLike._id);
            likeable.save();

        }
      
        return res.status(200).json({
            message: "Request successful!",
            data: {
                deleted: deleted
            }   
        })
        

    }catch(err){
        console.log(err);
        return res.json(500, {
            message: 'Internal Server Errorrrr'
        });
    }
}