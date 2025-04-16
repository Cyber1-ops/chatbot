// frontend/script.js
document.addEventListener('DOMContentLoaded', function () {
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const micButton = document.getElementById('mic-button');
  const languageToggle = document.getElementById('language-toggle');

  let defaultLang = 'en'; // 'en' or 'ar'

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message mb-3`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageIcon = document.createElement('div');
    messageIcon.className = 'message-icon';
    const icon = document.createElement('i');
    icon.className = sender === 'user' ? 'fas fa-user text-primary' : 'fas fa-robot text-success';
    messageIcon.appendChild(icon);

    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';
    messageBubble.textContent = text;

    messageContent.appendChild(messageIcon);
    messageContent.appendChild(messageBubble);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'message bot-message mb-3';
    typing.id = 'typing-indicator';

    const content = document.createElement('div');
    content.className = 'message-content';

    const icon = document.createElement('div');
    icon.className = 'message-icon';
    icon.innerHTML = '<i class="fas fa-robot text-success"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble typing';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      bubble.appendChild(dot);
    }

    content.appendChild(icon);
    content.appendChild(bubble);
    typing.appendChild(content);
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  async function sendMessage(message, lang = defaultLang) {
    if (!message.trim()) return;
    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.disabled = true;
    sendButton.disabled = true;
    showTypingIndicator();

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, lang })
      });

      const data = await response.json();
      removeTypingIndicator();
      addMessage(data.reply, 'bot');
    } catch (error) {
      console.error('Error:', error);
      removeTypingIndicator();
      addMessage("Sorry, I'm having trouble connecting to the server.", 'bot');
    } finally {
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.focus();
    }
  }

  sendButton.addEventListener('click', () => {
    sendMessage(messageInput.value, defaultLang);
  });

  messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage(messageInput.value, defaultLang);
  });

  // Language toggle
  languageToggle.addEventListener('click', () => {
    defaultLang = defaultLang === 'en' ? 'ar' : 'en';
    alert(`Language switched to ${defaultLang === 'en' ? 'English' : 'Arabic'}`);
  });

  // Voice Input
  let recognition;
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const detectedLang = /[\u0600-\u06FF]/.test(transcript) ? 'ar' : 'en';
      messageInput.value = transcript;
      sendMessage(transcript, detectedLang);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
    };
  } else {
    micButton.disabled = true;
    micButton.title = 'Voice not supported';
  }

  micButton.addEventListener('click', () => {
    if (recognition) {
      recognition.lang = defaultLang === 'ar' ? 'ar-SA' : 'en-US';
      recognition.start();
    }
  });
});
