// Gerekli HTML elementlerini seçiyoruz
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// localStorage için anahtar (key) tanımları
const USER_NAME_KEY = 'kyrosil_userName';
const SOCIAL_MEDIA_KEY = 'kyrosil_socialMedia';
const SOCIAL_USER_KEY = 'kyrosil_socialUser';

// === YENİ: Konuşma durumunu takip etmek için değişken ===
let conversationState = 'idle'; // Olası durumlar: 'idle', 'awaiting_name', 'awaiting_social', 'awaiting_username'
// =========================================================

// === YENİ: İzin verilen sosyal medya platformları ===
const allowedSocialMedia = ['instagram', 'eu portal', 'x', 'tiktok'];
// =====================================================

// localStorage'a veri kaydetme fonksiyonu
function saveData(key, value) {
    try {
        localStorage.setItem(key, value);
        console.log(`localStorage'a kaydedildi: ${key} = ${value}`); 
    } catch (e) {
        console.error("localStorage'a kaydederken hata oluştu:", e);
    }
}

// localStorage'dan veri okuma fonksiyonu
function loadData(key) {
    try {
        const data = localStorage.getItem(key);
        // console.log(`localStorage'dan okundu: ${key} = ${data}`); // Artık her seferinde yazdırmaya gerek yok
        return data; 
    } catch (e) {
        console.error("localStorage'dan okurken hata oluştu:", e);
        return null;
    }
}

// Sayfa yüklendiğinde mevcut verileri yükle
let currentUserName = loadData(USER_NAME_KEY);
let currentSocialMedia = loadData(SOCIAL_MEDIA_KEY);
let currentSocialUser = loadData(SOCIAL_USER_KEY);

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

// === YENİ: Bot mesajı ekleme ve gecikme fonksiyonu ===
function addBotMessage(text, delay = 600) {
    setTimeout(() => {
        addMessageToChatBox(text, 'bot-message');
    }, delay);
}
// ====================================================

// === YENİ: Konuşmayı başlatan veya devam ettiren fonksiyon ===
function startConversation() {
    // Başlangıç mesajını temizle (varsa) - ID eklememiz gerekebilir
    const initialBotMessage = chatBox.querySelector('.bot-message'); // İlk bot mesajını bul
    if (initialBotMessage && initialBotMessage.textContent.includes("Merhaba! Ben Kyrosilrewards botuyum.")) {
         // İsteğe bağlı: İlk mesajı kaldırabilir veya değiştirebiliriz. Şimdilik kalsın.
         // initialBotMessage.remove(); 
    }

    if (!currentUserName) {
        addBotMessage("Merhaba! Ben Kyrosilrewards botuyum. Seninle tanışmak istiyorum, adın nedir?", 100); // Daha hızlı sor
        conversationState = 'awaiting_name';
    } else if (!currentSocialMedia) {
        addBotMessage(`Tekrar merhaba ${currentUserName}! Bizi hangi sosyal medya platformundan takip ediyorsun? (Instagram, EU Portal, X, Tiktok)`, 100);
        conversationState = 'awaiting_social';
    } else if (!currentSocialUser) {
        addBotMessage(`Harika, ${currentSocialMedia} üzerinden takip etmene sevindim! Oradaki kullanıcı adın nedir?`, 100);
        conversationState = 'awaiting_username';
    } else {
        addBotMessage(`Merhaba ${currentUserName}, tekrar hoş geldin! Sana nasıl yardımcı olabilirim?`, 100);
        conversationState = 'idle'; // Her şey tamam, normal sohbet modu
    }
    // İlk yüklemede kaydır
    setTimeout(scrollToBottom, 150); 
}
// ============================================================

// Kullanıcı mesaj gönderme fonksiyonu (GÜNCELLENDİ)
function sendMessage() {
    const messageText = userInput.value.trim();

    if (messageText !== "") {
        // Kullanıcı mesajını her zaman ekle
        addMessageToChatBox(messageText, 'user-message');
        userInput.value = ''; // Input'u temizle

        // Konuşma durumuna göre işle
        if (conversationState === 'awaiting_name') {
            currentUserName = messageText; // İsmi al
            saveData(USER_NAME_KEY, currentUserName); // Kaydet
            addBotMessage(`Memnun oldum ${currentUserName}! Bizi hangi sosyal medya platformundan takip ediyorsun? (Instagram, EU Portal, X, Tiktok)`);
            conversationState = 'awaiting_social'; // Bir sonraki durumu bekle
        
        } else if (conversationState === 'awaiting_social') {
            const lowerCaseInput = messageText.toLowerCase();
            if (allowedSocialMedia.includes(lowerCaseInput)) {
                currentSocialMedia = lowerCaseInput; // Sosyal medyayı al (küçük harfle)
                saveData(SOCIAL_MEDIA_KEY, currentSocialMedia); // Kaydet
                addBotMessage(`Harika, ${currentSocialMedia} üzerinden takip etmene sevindim! Oradaki kullanıcı adın nedir?`);
                conversationState = 'awaiting_username'; // Bir sonraki durumu bekle
            } else {
                addBotMessage("Lütfen listedeki platformlardan birini yazar mısın? (Instagram, EU Portal, X, Tiktok)");
                // State değişmiyor, tekrar soruyor
            }

        } else if (conversationState === 'awaiting_username') {
            currentSocialUser = messageText; // Kullanıcı adını al
            saveData(SOCIAL_USER_KEY, currentSocialUser); // Kaydet
            addBotMessage(`Teşekkürler ${currentUserName}! Bilgilerin kaydedildi. Sana nasıl yardımcı olabilirim?`);
            conversationState = 'idle'; // Onboarding bitti, normal moda geç
        
        } else { // conversationState === 'idle' (Normal sohbet modu)
            // Temel selamlaşmaları kontrol et
            const lowerCaseInput = messageText.toLowerCase();
            if (lowerCaseInput === 'merhaba' || lowerCaseInput === 'selam') {
                 addBotMessage(`Merhaba ${currentUserName || ''}!`); // İsmi varsa ekle
            } else if (lowerCaseInput === 'naber' || lowerCaseInput === 'nasılsın') {
                 addBotMessage("İyiyim, sorduğun için teşekkürler! Sen nasılsın?");
            } 
            // === Komut Kontrolü Buraya Eklenecek ===
            // else if (messageText.startsWith('/')) { ... }
            
            // Diğer tüm durumlarda genel cevap
            else {
                addBotMessage("Mesajınızı aldım!"); // Şimdilik standart cevap
            }
        }
    }
}


// Gönder butonuna tıklandığında sendMessage fonksiyonunu çalıştır
sendButton.addEventListener('click', sendMessage);

// Yazı kutusundayken Enter tuşuna basıldığında sendMessage fonksiyonunu çalıştır
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// === YENİ: Sayfa yüklendiğinde konuşmayı başlat ===
startConversation();
// ===============================================
