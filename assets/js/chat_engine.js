

class ChatEngine {

    constructor(chatBoxId, userEmail,toUser) {
        this.chatBox = $(`#${chatBoxId}`),
        this.userEmail = userEmail,
        this.to_user=toUser,
        this.socket = io.connect('http://43.205.209.122:5000', {
            transports: ['polling'] ,
        });

        if (this.userEmail) {
            this.fetchPreviousMessages();
            this.connectionHandler();
        }   
    }         

    async fetchPreviousMessages() {
        
        try {
            const response = await fetch(`/chat/getPreviousMessages/${this.to_user}/`); 
            const data = await response.json();
            
            if (data.messages) {
                data.messages.forEach((message) => {
                    
                    this.displayMessage(message);
                });
                this.scrollChatToBottom();        
            }
        } catch (error) {   
            console.error('Error fetching previous messages:', error);
        }
    }

    scrollChatToBottom() {
        
        var chatMessagesList = document.getElementById("chat-messages-list");
        if (chatMessagesList) {
            chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
        }
    }
    
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
                        
                        let startIndex = 0;
                        while (startIndex < word.length) {
                            lines.push(word.substring(startIndex, startIndex + lineLength)+'-');
                            startIndex += lineLength;
                        }
                        let w=lines.pop();
                        w=w.substring(0,w.length-1);
                        
                        currentLine =  w + ' ';
                }

            }
        }

        if (currentLine) {
            lines.push(currentLine.trim()); 
        }
    
        return lines;
    }
    
    displayMessage(data) {
        const messageType = data.user_email === this.userEmail ? 'self-message' : 'other-message';
        const messageText = data.message;
    
        const lines = this.splitMessage(messageText, 10);  
    
        const messageList = $('<li>').addClass(messageType);
    
        lines.forEach((line, index) => {
            const spanLine = $('<span>').html(line);
            const lineDiv = $('<div>').append(spanLine);  
            messageList.append(lineDiv);
        });
    
        $('#chat-messages-list').append(messageList);
    
        
        this.scrollChatToBottom();
    }
    
            

    connectionHandler() {
        let self = this;
        this.socket.on('connect', function() {
            console.log('connection established using sockets...!' , self.userEmail && self.to_user==null , self.to_user==null , self.userEmail,self.to_user);
            if (self.userEmail && self.to_user==null) {  
                
                self.socket.emit('join_room', {
                    user_email: self.userEmail,
                    chatroom: 'EternalEchoes',
                    to_user:null
                });
            }else{
                
                self.socket.emit('join_personal_room', {
                    user_email: self.userEmail,
                    chatroom: 'ConnectDots_Personal',
                    to_user:self.to_user
                });
            }

            self.socket.on('user_joined', function(data) {
                
            });
            self.socket.on('user_joined2', function(data) {
                
            });
        });

        
        $('#send-message').click(function() {
            let msg = $('#chat-message-input').val();
            
            if (msg !== '' && msg.length<=50) {
                if (self.to_user == null) { 
                    self.socket.emit('send_message', {
                        message: msg,
                        user_email: self.userEmail,
                        chatroom: 'EternalEchoes',
                        to_user:null
                    });
                } else { 
                    self.socket.emit('send_message2', {
                        message: msg,
                        user_email: self.userEmail,
                        chatroom: 'ConnectDots_Personal',
                        to_user: self.to_user
                    });
                }

                
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
            
            self.displayMessage(data);  
        });

        this.socket.on('receive_message2', function(data) {
  
            if(data.user_email==self.to_user  || data.user_email==self.userEmail){
                self.displayMessage(data);
            }
        });  
       
    }
}

function displayFlashMessage(message, isError) {
    const flashContainer = document.getElementById('flash-messages');

    const messageElement = document.createElement('div');
    
    messageElement.classList.add('flash-message', isError ? 'error' : 'success');
    messageElement.innerText = message;

    flashContainer.appendChild(messageElement);

    
    setTimeout(() => {
        
        messageElement.classList.add('fadeOut');
         
        setTimeout(() => {
            messageElement.remove();
        }, 500);
    }, 4500);
}


