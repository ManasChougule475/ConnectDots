// class ChatEngine{
//     constructor(chatBoxId, userEmail){
//         this.chatBox = $(`#${chatBoxId}`);                                  
//         this.userEmail = userEmail;
        
//         this.socket = io.connect('http://localhost:5000' ,{transports: ['polling']}); // io is given to us by socket.io file included in home.ejs 
//         // here no one accepting the connection at 5000 right now
//         // io.connect fires an event called connection
//         if (this.userEmail){
//             this.connectionHandler();
//         }

//     }


//     connectionHandler(){ // this will have the to & fro interaction with the obeserver & the subscriber
//         let self = this; // since this has been changed inside the on('connect' , f(){..})
        
//         this.socket.on('connect', function(){ // on is used to detect an event ; when 'connect' evet happens , calling callback fun.
//             console.log('connection established using sockets...!');

//                              // 'join_room' is the name of the event , it can be any but usually same to the server side also
//                              // while sending the request to join room , you can send the data {}
//             self.socket.emit('join_room', { // user1 sends his request to server to join to the chatroom 'codeial' & then waits until some other user comes online
//                 user_email: self.userEmail, // when you click on someone's name then you want to start the chat with that user 
//                 chatroom: 'codeial'  // room that user want's to join // whenever 2 or more users are chatting with each other we create a virtual environment called chatroom
//             });

//             self.socket.on('user_joined', function(data){ // message to user1  by server regarding user2 joined ; user1 sends the request & here by 'on' message emited by the server is detected
//                 console.log('a user joined!', data);     
//             })    


//         });

//         // CHANGE :: send a message on clicking the send message button
//         $('#send-message').click(function(){ 
//             let msg = $('#chat-message-input').val(); // fetching value from the send button

//             if (msg != ''){// 1.when user clicks on send button if message is not empty then the send button emits an event called send_message
//                 self.socket.emit('send_message', {
//                     message: msg,
//                     user_email: self.userEmail,
//                     chatroom: 'codeial'
//                 });
//             }
//         });

//         self.socket.on('receive_message', function(data){ // 4. user detects the receive_message event 
//             console.log('message received', data.message);


//             let newMessage = $('<li>'); // 5. to consturct li and append it to ul 

//             let messageType = 'other-message';

//             if (data.user_email == self.userEmail){ //6. data.user_email is email of user(let say user1) who had initially made the request to the server by clicking on send button ; self.userEmail is the user who has further received this data(of user1) from server
//                 messageType = 'self-message'; // my message getting back me from the server also indicates that my message has been also sent to all the other users in chatroom
//             }

//             newMessage.append($('<span>', {
//                 'html': data.message
//             }));

//             newMessage.append($('<sub>', {
//                 'html': data.user_email
//             }));

//             newMessage.addClass(messageType);

//             $('#chat-messages-list').append(newMessage); // finally appending newMessage to list
//         });
//     };
// }

class ChatEngine {

    constructor(chatBoxId, userEmail,toUser) {
        this.chatBox = $(`#${chatBoxId}`),
        this.userEmail = userEmail,
        this.to_user=toUser,
        this.socket = io.connect('http://13.127.17.176:5000', { transports: ['polling'] });
        if (this.userEmail) {
            this.fetchPreviousMessages();
            this.connectionHandler();
        }   
    }      

    async fetchPreviousMessages() {
        console.log('prev');
        try {
            const response = await fetch(`/chat/getPreviousMessages/${this.to_user}/`); 
            const data = await response.json();
            console.log(')))))',data,data.messages);
            if (data.messages) {
                data.messages.forEach((message) => {
                    // console.log('message=',message);
                    this.displayMessage(message);
                });
                this.scrollChatToBottom();        
            }
        } catch (error) {   
            console.error('Error fetching previous messages:', error);
        }
    }

    scrollChatToBottom() {
        // Scroll to the bottom of the chat messages list
        var chatMessagesList = document.getElementById("chat-messages-list");
        if (chatMessagesList) {
            chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
        }
    }
    
    
    // displayMessage(data) {
    //     const messageType = data.user_email === this.userEmail ? 'self-message' : 'other-message';

    //     const newMessage = $('<li>')
    //     .addClass(messageType)
    //     .append($('<span>').html(data.message)); // .append($('<span>', { 'html': data.message }));

    //     // newMessage.append($('<sub>', { 'html': data.user_email }));
    //     newMessage.addClass(messageType);
    
    //     $('#chat-messages-list').append(newMessage);  
          
    //     // Scroll to the bottom after displaying a new message
    //     this.scrollChatToBottom();
    // }    


    splitMessage(message, lineLength) {
        const lines = [];
        const words = message.split(' ');
    
        let currentLine = '';
    
        for (const word of words) {
            if (currentLine.length + word.length <= lineLength) {
                currentLine += word + ' ';
            } else {
                if(word.length<=lineLength){
                    lines.push(currentLine.trim());
                    currentLine = word + ' ';
                }else{
                        // Word needs to be split
                        let startIndex = 0;
                        while (startIndex < word.length) {
                            lines.push(word.substring(startIndex, startIndex + lineLength)+'-');
                            startIndex += lineLength;
                        }
                        let w=lines.pop();
                        w=w.substring(0,w.length-1);
                        // lines.push(w); // gets added in if statement
                        currentLine =  w + ' ';
                }

            }
        }

        if (currentLine) {
            lines.push(currentLine.trim()); // add padding here
        }
    
        return lines;
    }
    
    displayMessage(data) {
        const messageType = data.user_email === this.userEmail ? 'self-message' : 'other-message';
        const messageText = data.message;
    
        const lines = this.splitMessage(messageText, 10);  // Split message into lines of 10 characters each
    
        const messageList = $('<li>').addClass(messageType);
    
        lines.forEach((line, index) => {
            const spanLine = $('<span>').html(line);
            const lineDiv = $('<div>').append(spanLine);  // Each line is in a separate div
            messageList.append(lineDiv);
        });
    
        $('#chat-messages-list').append(messageList);
    
        // Scroll to the bottom after displaying a new message
        this.scrollChatToBottom();
    }
    
            

    connectionHandler() {
        let self = this;
        this.socket.on('connect', function() {
            console.log('connection established using sockets...!' , self.userEmail && self.to_user==null , self.to_user==null , self.userEmail,self.to_user);
            if (self.userEmail && self.to_user==null) {  //self.userEmail && !self.to_user 
                console.log('88888');
                self.socket.emit('join_room', {
                    user_email: self.userEmail,
                    chatroom: 'codeial',
                    to_user:null
                });
            }else{
                console.log('99999');
                self.socket.emit('join_personal_room', {
                    user_email: self.userEmail,
                    chatroom: 'codeial_personal',
                    to_user:self.to_user
                });
            }

            self.socket.on('user_joined', function(data) {
                // console.log('a user joined!', data,this.socket);
            });
            self.socket.on('user_joined2', function(data) {
                // console.log('a user joined2!', data,this.socket);
            });
        });

        
        $('#send-message').click(function() {
            let msg = $('#chat-message-input').val();
            
            if (msg !== '' && msg.length<=50) {
                if (self.to_user == null) { // global chat messages
                    self.socket.emit('send_message', {
                        message: msg,
                        user_email: self.userEmail,
                        chatroom: 'codeial',
                        to_user:null
                    });
                } else { // local chat messages
                    self.socket.emit('send_message2', {
                        message: msg,
                        user_email: self.userEmail,
                        chatroom: 'codeial_personal',
                        to_user: self.to_user
                    });
                }

                // Clear the input box after sending the message
                $('#chat-message-input').val('');

            } else {
                if(msg==''){
                    displayFlashMessage("Message is empty!!!", true);
                }else{
                    displayFlashMessage('Message length should be less than 5', true);
                }
            }

        });

        this.socket.on('receive_message', function(data) {
            console.log('message received', data.message);
            self.displayMessage(data);  
        });

        this.socket.on('receive_message2', function(data) {
            console.log('message received2', data)
            // if(data.user_email==self.to_user && data.to_user==self.userEmail){
            //     // by io.in(data.chatroom).emit('') 
            //     // message is broadcasted to all the users , but with above checks it is shown to relevant users
            //     self.displayMessage(data);  
            // }   
            if(data.user_email==self.to_user  || data.user_email==self.userEmail){
                self.displayMessage(data);
            }
        });  
       
    }
}

function displayFlashMessage(message, isError) {
    const flashContainer = document.getElementById('flash-messages');

    const messageElement = document.createElement('div');
    // Add appropriate classes for styling
    messageElement.classList.add('flash-message', isError ? 'error' : 'success');
    messageElement.innerText = message;

    flashContainer.appendChild(messageElement);

    // Automatically remove the message after some time (e.g., 5 seconds)
    setTimeout(() => {
        // Add a fade-out effect before removing the message
        messageElement.classList.add('fadeOut');
         // Remove the message after the fade-out animation completes
        setTimeout(() => {
            messageElement.remove();
        }, 500);
    }, 4500);
}


//The findOne() function is used to find one document according to the condition. If multiple documents match the condition, then it returns the first document satisfying the condition. 