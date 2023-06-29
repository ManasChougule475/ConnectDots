// module.exports.home = function(req , res){    
//     return res.render("home" , {
//         title:'Home'
//     })
// }

const Post = require('../models/post');
module.exports.home = function(req,res){
    // Post.find({})
    // .then((posts)=>{
    //     return res.render('home' , {
    //         title : 'Codeial | Home',
    //         posts : posts
    //     });
    // });

    Post.find({}).populate('user')
    .then((posts)=>{
        return res.render('home' , {
            title : 'Codeial | Home',
            posts : posts
        });
    });
}