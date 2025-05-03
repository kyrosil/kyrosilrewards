// Gerekli HTML elementlerini seçiyoruz
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// === YENİ: localStorage için anahtar (key) tanımları ===
const USER_NAME_KEY = 'kyrosil_userName';
const SOCIAL_MEDIA_KEY = 'kyrosil_socialMedia';
const SOCIAL_USER_KEY = 'kyrosil_socialUser';
// =======================================================

// === YENİ: localStorage'a veri kaydetme fonksiyonu ===
function saveData(key, value) {
    try {
        localStorage.setItem(key, value);
        console.log(`localStorage'a kaydedildi: ${key} = ${value}`); // Konsola bilgi yaz
    } catch (e) {
        console.error("localStorage'a kaydederken hata oluştu:", e);
    }
}
// =====================================================

// === YENİ: localStorage'dan veri okuma fonksiyonu ===
function loadData(key) {
    try {
        const data = localStorage.getItem(key);
        console.log(`localStorage'dan okundu: ${key} = ${data}`); // Konsola bilgi yaz
        return data; // Okunan veriyi (veya null) döndür
    } catch (e) {
        console.error("localStorage'dan okurken hata oluştu:", e);
        return null;
    }
}
// ===================================================

// === YENİ: Sayfa yüklendiğinde localStorage'dan verileri yüklemeyi dene ===
let currentUserName = loadData(USER_NAME_KEY);
let currentSocialMedia = loadData(SOCIAL_MEDIA_KEY);
let currentSocialUser = loadData(SOCIAL_USER_KEY);
// Şimdilik bu değişkenlerle bir şey yapmıyoruz, sadece yükleme fonksiyonlarını test ediyoruz.
// =====================================================================

// Kullanıcı mesaj gönderme fonksiyonu
function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText !== "") {
        addMessageToChatBox(messageText, 'user-message');
        userInput.value = ''; 
        setTimeout(generateBotResponse, 600); 
    }
}

// Bot'un cevap üretme fonksiyonu (şimdilik sabit cevap)
function generateBotResponse() {
    const botReply = "Mesajınızı aldım!"; 
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
    scrollToBottom(); 
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
