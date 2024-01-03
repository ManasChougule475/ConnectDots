const Post = require('../models/post')
const Comment = require('../models/comment')
const Like = require('../models/like')

module.exports.create = async function(req, res){

    // Post.create({
    //     content: req.body.content,
    //     user: req.user._id
    // })
    // .then(post=>{
    //     return res.redirect('back'); // back on home page
    // })
    // .catch((err)=>{
    //     console.log('error in creating a post'); return;
    // });

    try{
        let post = await Post.create({
            content : req.body.content,
            user : req.user._id
        })


        if(req.xhr){
            return res.status(200).json({
                data:{
                    post:post
                },
                message : "Post Created!"
            })
        }
        req.flash("success" , "Post Published!");

        return res.redirect('back');
    }
    catch(err){
        console.log(err);
    }
    
}


module.exports.destroy =  async function(req , res){
    // Post.findById(req.params.id)  
    // .then((post)=>{
    //     if(post.user == req.user.id){ 
    //         post.deleteOne();
    //         Comment.deleteMany({post: req.params.id})
    //         .then((staus)=>{
    //             console.log(staus) // { acknowledged: true, deletedCount: 3 } // 3 is number of comments deleted for corresponding post 
    //             return res.redirect('back');
    //         })
    //     }
    //     else{
    //         return res.redirect('back'); 
    //     }
    // })

    try {
        let post = await Post.findById(req.params.id);
        if(post.user == req.user.id){
            // CHANGE :: delete the associated likes for the post and all its comments' likes too
            await Like.deleteMany({likeable: post, onModel: 'Post'});
            await Like.deleteMany({_id: {$in: post.comments}});

            
            post.deleteOne();
            let comments = await Comment.deleteMany({post : req.params.id});

            if(req.xhr){
                return res.status(200).json({
                    data:{
                        post_id: req.params.id
                    },
                    message : "Post Deleted!"
                })
            }
            req.flash("success" , "Post & associated comments are deleted!");


        }
        return res.redirect('back');
    } catch (error) {
        console.log(error);
    }
}


