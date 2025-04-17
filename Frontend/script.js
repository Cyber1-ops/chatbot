// DOM Elements
const chatToggle = document.getElementById('chat-toggle');
const chatContainer = document.getElementById('chat-container');
const chatMessages = document.getElementById('chat-messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const closeButton = document.getElementById('close-button');
const expandButton = document.getElementById('expand-button');
const typingIndicator = document.getElementById('typing-indicator');
const imageButton = document.getElementById('image-button');
const imageInput = document.getElementById('image-input');

// Chat State
let isOpen = false;
let isExpanded = false;
let isTyping = false;
let isUploading = false;
let messages = [
  {
    id: '1',
    content: 'Hello! I am Motoro, your AI assistant. How can I help you today?',
    sender: 'bot',
    timestamp: new Date(),
  }
];

// Initialize Chat
function initChat() {
  renderMessages();
  setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
  // Chat toggle button
  chatToggle.addEventListener('click', toggleChat);
  
  // Close button
  closeButton.addEventListener('click', toggleChat);
  
  // Expand button
  expandButton.addEventListener('click', toggleExpand);
  
  // Message form submission
  messageForm.addEventListener('submit', handleSendMessage);
  
  // Message input auto-resize and enter key handling
  messageInput.addEventListener('input', autoResizeTextarea);
  messageInput.addEventListener('keydown', handleKeyDown);
  
  // Image upload
  imageButton.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', handleImageUpload);
}

// Toggle chat open/closed
function toggleChat() {
  isOpen = !isOpen;
  
  if (isOpen) {
    chatContainer.classList.remove('chat-hidden');
    chatToggle.classList.add('active');
    scrollToBottom();
  } else {
    chatContainer.classList.add('chat-hidden');
    chatToggle.classList.remove('active');
    isExpanded = false;
    chatContainer.classList.remove('expanded');
  }
}

// Toggle chat expanded/collapsed
function toggleExpand() {
  isExpanded = !isExpanded;
  
  if (isExpanded) {
    chatContainer.classList.add('expanded');
    expandButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
  } else {
    chatContainer.classList.remove('expanded');
    expandButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
  }
  
  scrollToBottom();
}

// Handle message submission
function handleSendMessage(event) {
  event.preventDefault();
  
  const content = messageInput.value.trim();
  
  if (content && !isTyping && !isUploading) {
    sendMessage(content);
    messageInput.value = '';
    autoResizeTextarea();
  }
}

// Handle keyboard events
function handleKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    messageForm.dispatchEvent(new Event('submit'));
  }
}

// Auto-resize textarea
function autoResizeTextarea() {
  messageInput.style.height = 'auto';
  messageInput.style.height = (messageInput.scrollHeight) + 'px';
  
  // Enable/disable send button based on content
  if (messageInput.value.trim()) {
    sendButton.disabled = false;
  } else {
    sendButton.disabled = true;
  }
}

// Send message
function sendMessage(content) {
  // Add user message
  const userMessage = {
    id: Date.now().toString(),
    content,
    sender: 'user',
    timestamp: new Date(),
  };
  
  messages.push(userMessage);
  renderMessages();
  scrollToBottom();
  
  // Show typing indicator
  showTypingIndicator();
  
  // Get bot response after a delay
  setTimeout(() => {
    generateBotResponse(content);
  }, 1500);
}

// Generate bot response
async function generateBotResponse(userMessage) {
  try {
    // Show typing indicator
    showTypingIndicator();

    // Make API call to backend
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Add bot message
    const botMessage = {
      id: (Date.now() + 1).toString(),
      content: data.reply.replace(/idncu:\s*\d+/g, ""),
      sender: 'bot',
      timestamp: new Date(),
    };
    sessionStorage.removeItem("lastMessage");
    sessionStorage.setItem("lastMessage", data.reply);
    messages.push(botMessage);
    hideTypingIndicator();
    renderMessages();
    scrollToBottom();
  } catch (error) {
    console.error('Error getting bot response:', error);
    
    // Add error message
    const errorMessage = {
      id: (Date.now() + 1).toString(),
      content: "I'm sorry, I'm having trouble connecting to the server. Please try again later.",
      sender: 'bot',
      timestamp: new Date(),
    };

    messages.push(errorMessage);
    hideTypingIndicator();
    renderMessages();
    scrollToBottom();
  }
}

// Handle image upload
async function handleImageUpload(event) {
  const file = event.target.files[0];
  
  if (file) {
    isUploading = true;
    
    // Create image URL
    const imageUrl = URL.createObjectURL(file);
    
    // Add user image message
    const userImageMessage = {
      id: Date.now().toString(),
      content: 'Image sent',
      sender: 'user',
      timestamp: new Date(),
      imageUrl: imageUrl,
    };
    
    messages.push(userImageMessage);
    renderMessages();
    scrollToBottom();
    
    // Show typing indicator
    showTypingIndicator();

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('image', file);
      formData.append('message', 'Analyze this image');

      // Send image to backend
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add bot response
      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: 'bot',
        timestamp: new Date(),
      };
      messages.push(botMessage);
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble analyzing the image. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      messages.push(errorMessage);
    }
    
    hideTypingIndicator();
    renderMessages();
    scrollToBottom();
    isUploading = false;
    
    // Reset file input
    event.target.value = '';
  }
}

// Show typing indicator
function showTypingIndicator() {
  isTyping = true;
  typingIndicator.classList.remove('hidden');
  scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
  isTyping = false;
  typingIndicator.classList.add('hidden');
}

// Render messages
function renderMessages() {
  chatMessages.innerHTML = '';
  
  messages.forEach(message => {
    const messageElement = createMessageElement(message);
    chatMessages.appendChild(messageElement);
  });
}

// Create message element
function createMessageElement(message) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.classList.add(message.sender === 'user' ? 'message-user' : 'message-bot');
  
  // Add image if present
  if (message.imageUrl) {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('message-image');
    
    const image = document.createElement('img');
    image.src = message.imageUrl;
    image.alt = 'Uploaded image';
    
    imageContainer.appendChild(image);
    messageDiv.appendChild(imageContainer);
  }
  
  // Add message content
  const contentP = document.createElement('p');
  contentP.classList.add('message-content');
  contentP.textContent = message.content;
  messageDiv.appendChild(contentP);
  
  // Add message timestamp
  const timeP = document.createElement('p');
  timeP.classList.add('message-time');
  timeP.textContent = formatTime(message.timestamp);
  messageDiv.appendChild(timeP);
  
  return messageDiv;
}

// Format time
function formatTime(timestamp) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

// Scroll to bottom of messages
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Clear messages
function clearMessages() {
  messages = [
    {
      id: Date.now().toString(),
      content: 'Hello! I am Motoro, your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ];
  renderMessages();
}

// Initialize the chat
document.addEventListener('DOMContentLoaded', initChat);
