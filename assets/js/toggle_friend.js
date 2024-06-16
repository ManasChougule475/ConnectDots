// 
class ToggleFriend{
    constructor(toggleElement){
        this.toggleFriendBtn = toggleElement;
        this.toggleFriend();
    }

    toggleFriend(){
        $(this.toggleFriendBtn).click(function(event){
            // 
            event.preventDefault();
            
            let self = this;
            let action = $(self).data('action');
            $.ajax({
                type : "GET",       
                url :  $(self).attr('href') + `&action=${action}`,    
            })
            .done(function(data){
                
                if(data.data.deleted==true){
                    
                    // $(this.toggleFriendBtn).html("Add Friend")
                    $(self).html(`Add Friend`);
                    // if (action === 'remove') {
                        window.location.reload(); 
                    // }
                }else if (data.data.deleted==false){  
                    
                    // $(self).html(`Remove Friend`);
                    if (action === 'add') {
                        if(data.data.flag==1){
                            // window.location.href = 'http://localhost:8000/users/pending-friend-requests/'; // Redirect to the pending friend requests page
                            $(self).html(`Pending`);
                        }
                        window.location.reload();  // reload same page
                    }
                    if (action === 'remove') {
                        if(data.data.flag==0){
                            $(self).html(`Add Frienddd`);
                        }
                        window.location.reload(); 
                    }
                }else if (data.data.closeFriendDeleted==1){     
                    
                    $(self).html(`Add`);
                }else if (data.data.closeFriendDeleted==0){  
                    
                    $(self).html(`Remove`);
                }    
            })
            .fail(function(error) {
                
            });

        });
    }

// toggleFriend($(".toggle-friend-btn"));
// new ToggleFriend($(' .toggle-friend-btn'));

}

