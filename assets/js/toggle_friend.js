// console.log('toggle_friend.js loaded');
class ToggleFriend{
    constructor(toggleElement){
        this.toggleFriendBtn = toggleElement;
        this.toggleFriend();
    }

    toggleFriend(){
        $(this.toggleFriendBtn).click(function(event){
            // console.log('prevent default is going to happen');
            event.preventDefault();
            let self = this;
            $.ajax({
                type : "GET",       
                url :  $(self).attr('href'),
            })
            .done(function(data){
                console.log(data);
                if(data.data.deleted==true){
                    console.log('friendship is removed so deleted(existing friendship) is' , data.data.deleted);
                    // $(this.toggleFriendBtn).html("Add Friend")
                    $(self).html(`Add Friend`);
                }else{  
                    console.log('friendship is added so deleted(existing friendship) is' , data.data.deleted);
                    $(self).html(`Remove Friend`);
                }       
            })
            .fail(function(error) {
                console.log('error in completing the request' , error.responseText);
            });

        });
    }

// toggleFriend($(".toggle-friend-btn"));
// new ToggleFriend($(' .toggle-friend-btn'));

}

