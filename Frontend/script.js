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

// Handle key down events
function handleKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage(event);
  }
}

// Send message
async function sendMessage(content) {
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
  
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: content })
    });

    const data = await response.json();
    
    // Remove typing indicator
    hideTypingIndicator();
    
    // Add bot response
    const botMessage = {
      id: (Date.now() + 1).toString(),
      content: data.reply,
      sender: 'bot',
      timestamp: new Date(),
    };
    
    messages.push(botMessage);
    renderMessages();
    scrollToBottom();
  } catch (error) {
    console.error('Error:', error);
    hideTypingIndicator();
    
    // Add error message
    const errorMessage = {
      id: (Date.now() + 1).toString(),
      content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
      sender: 'bot',
      timestamp: new Date(),
    };
    
    messages.push(errorMessage);
    renderMessages();
    scrollToBottom();
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

// Handle image upload
function handleImageUpload(event) {
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
    
    // Simulate bot response after delay
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: "I've received your image. What would you like to know about it?",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      messages.push(botMessage);
      hideTypingIndicator();
      renderMessages();
      scrollToBottom();
      isUploading = false;
    }, 1500);
    
    // Reset file input
    event.target.value = '';
  }
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
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Scroll to bottom of messages
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize the chat
document.addEventListener('DOMContentLoaded', initChat);
