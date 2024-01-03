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




// module.exports.toggleSave =  async function(req, res){
//     try{ 

//         // save-post/toggle/?id=post_id  
//         let post; // this is the post on which user clicked to save or unsave
//         let deleted = false;

//         // fetching the post(object on which like is made i.e post or comment) from the database
//         post = await Post.findById(req.query.id);
//         let user =  await User.findOne({email:req.query.email});

//         // fetch post from collection with saved_status:true
//         let existingPost = await Post.findOne({
//             likeable: req.query.id,
//             onModel: req.query.type,
//             user: req.user._id
//         })

//         // if a like already exists then delete it
//         if (existingPost){
//             likeable.likes.pull(existingLike._id); // pull:- removing
//             likeable.save();

//             existingLike.deleteOne();
//             deleted = true;

//         }else{
//             // else make a new like

//             let newLike = await Like.create({
//                 user: req.user._id,
//                 likeable: req.query.id,
//                 onModel: req.query.type
//             });

//             likeable.likes.push(newLike._id);
//             likeable.save();

//         }
      
//         return res.status(200).json({
//             message: "Request successful!",
//             data: {
//                 deleted: deleted
//             }   
//         })
        

//     }catch(err){
//         console.log(err);
//         return res.json(500, {
//             message: 'Internal Server Errorrrr'
//         });
//     }
// }