// module.exports.home = function(req , res){    
//     return res.render("home" , {
//         title:'Home'
//     })
// }

const Post = require('../models/post');
const User = require('../models/user');

module.exports.home =  async function(req,res){

    // Post.find({})
    // .populate('user')// to preloading  or prepopulating  multiple models
    // .populate({
    //     path : 'comments',
    //     populate :{  // to further polulate (can do as much nesting as want) , nested prepopulating
    //         path :'user'
    //     }
    // })
    // .exec()
    // .then((posts)=>{
    //     User.find({})  
    //     .then((users)=>{
    //         return res.render('home' , {
    //             title : 'Codeial | Home',
    //             posts : posts,
    //             all_users :users,
    //         });
    //     })
    // });


    try{
        let posts = await Post.find({})
        .sort('-createAt')
        .populate('user')
        .populate({
            path : 'comments' ,
            populate : {
                path : 'user'  // user who posted a particular comment(check comment schema)
            }
        })
        .populate({
            path : 'comments' ,
            populate : {
                path : 'likes' // likes on a particular comment
            }
        })
        .populate('likes');



        let users = (await User.find({}))

        // friends
        let friends;
        if (req.user){
            let current_user = await User.findById(req.user._id)
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
            });
            friends = current_user.friendships; // all friends of signed in user
        }else{
            friends = [];
        }
        return res.render('home' , {
            title : 'Codeial | Home',
            posts : posts , 
            all_users : users ,
            all_friends : friends  
        });

    }
    catch(err){
        console.log(err);
        return;
    }
}
