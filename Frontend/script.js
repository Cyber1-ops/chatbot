// frontend/script.js
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    // Focus the input field when the page loads
    messageInput.focus();
    
    // Function to add a message to the chat
    function addMessage(text, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${sender}-message mb-3`;
      
      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      
      const messageIcon = document.createElement('div');
      messageIcon.className = 'message-icon';
      
      const icon = document.createElement('i');
      if (sender === 'user') {
        icon.className = 'fas fa-user text-primary';
      } else {
        icon.className = 'fas fa-robot text-success';
      }
      
      messageIcon.appendChild(icon);
      
      const messageBubble = document.createElement('div');
      messageBubble.className = 'message-bubble';
      messageBubble.textContent = text;
      
      messageContent.appendChild(messageIcon);
      messageContent.appendChild(messageBubble);
      messageDiv.appendChild(messageContent);
      
      chatMessages.appendChild(messageDiv);
      
      // Scroll to the bottom of the chat
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to show the typing indicator
    function showTypingIndicator() {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message bot-message mb-3';
      messageDiv.id = 'typing-indicator';
      
      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      
      const messageIcon = document.createElement('div');
      messageIcon.className = 'message-icon';
      
      const icon = document.createElement('i');
      icon.className = 'fas fa-robot text-success';
      messageIcon.appendChild(icon);
      
      const messageBubble = document.createElement('div');
      messageBubble.className = 'message-bubble typing';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        messageBubble.appendChild(dot);
      }
      
      messageContent.appendChild(messageIcon);
      messageContent.appendChild(messageBubble);
      messageDiv.appendChild(messageContent);
      
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to remove the typing indicator
    function removeTypingIndicator() {
      const typingIndicator = document.getElementById('typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }
    
    // Function to send a message
    async function sendMessage() {
      const message = messageInput.value.trim();
      
      if (message === '') return;
      
      // Add user message to chat
      addMessage(message, 'user');
      
      // Clear input field
      messageInput.value = '';
      
      // Disable input and button while waiting for response
      messageInput.disabled = true;
      sendButton.disabled = true;
      
      // Show typing indicator
      showTypingIndicator();
      
      try {
        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response to chat
        addMessage(data.reply, 'bot');
      } catch (error) {
        console.error('Error:', error);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add error message
        addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
      } finally {
        // Re-enable input and button
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
      }
    }
    
    // Send message when send button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  });