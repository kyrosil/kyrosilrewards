// Gerekli HTML elementlerini seçiyoruz
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Kullanıcı mesaj gönderme fonksiyonu
function sendMessage() {
    const messageText = userInput.value.trim();

    if (messageText !== "") {
        // Kullanıcı mesajını ekle
        addMessageToChatBox(messageText, 'user-message');
        userInput.value = ''; // Input'u temizle

        // Bot'un cevap vermesi için küçük bir gecikme ekleyelim
        setTimeout(generateBotResponse, 600); // 600 milisaniye (0.6 saniye) sonra cevap ver
    }
}

// Bot'un cevap üretme fonksiyonu (şimdilik sabit cevap)
function generateBotResponse() {
    // Burada daha sonra komutları veya yapay zekayı işleyebiliriz.
    // Şimdilik sabit bir cevap verelim:
    const botReply = "Mesajınızı aldım!"; 
    
    // Bot mesajını ekle
    addMessageToChatBox(botReply, 'bot-message');
}

// Mesajı sohbet kutusuna ekleyen yardımcı fonksiyon
function addMessageToChatBox(text, messageClass) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', messageClass); 
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text; 
    messageElement.appendChild(paragraph); 

    chatBox.appendChild(messageElement);
    scrollToBottom(); // Her mesaj eklendiğinde en alta kaydır
}

// Sohbet kutusunu en alta kaydıran yardımcı fonksiyon
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Gönder butonuna tıklandığında sendMessage fonksiyonunu çalıştır
sendButton.addEventListener('click', sendMessage);

// Yazı kutusundayken Enter tuşuna basıldığında sendMessage fonksiyonunu çalıştır
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Sayfa ilk yüklendiğinde de en alta kaydır
scrollToBottom();
