// Gerekli HTML elementlerini seçiyoruz
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// localStorage için anahtar (key) tanımları
const USER_NAME_KEY = 'kyrosil_userName';
const SOCIAL_MEDIA_KEY = 'kyrosil_socialMedia';
const SOCIAL_USER_KEY = 'kyrosil_socialUser';

// Konuşma durumunu takip etmek için değişken
let conversationState = 'idle'; // Olası durumlar: 'idle', 'awaiting_name', 'awaiting_social', 'awaiting_username', 'awaiting_reset_confirmation'

// İzin verilen sosyal medya platformları
const allowedSocialMedia = ['instagram', 'eu portal', 'x', 'tiktok'];

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
        return data; 
    } catch (e) {
        console.error("localStorage'dan okurken hata oluştu:", e);
        return null;
    }
}

// === YENİ: localStorage'dan veri silme fonksiyonu ===
function removeData(key) {
     try {
        localStorage.removeItem(key);
        console.log(`localStorage'dan silindi: ${key}`); 
    } catch (e) {
        console.error("localStorage'dan silerken hata oluştu:", e);
    }
}
// ====================================================

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

// Bot mesajı ekleme ve gecikme fonksiyonu
function addBotMessage(text, delay = 600) {
    setTimeout(() => {
        addMessageToChatBox(text, 'bot-message');
    }, delay);
}

// Sohbet kutusunu en alta kaydıran yardımcı fonksiyon
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Konuşmayı başlatan veya devam ettiren fonksiyon
function startConversation() {
    // Eğer localStorage boşsa veya isim yoksa onboarding başlar
    if (!currentUserName) {
        addBotMessage("Merhaba! Ben Kyrosilrewards botuyum. Seninle tanışmak istiyorum, adın nedir?", 100); 
        conversationState = 'awaiting_name';
    } else if (!currentSocialMedia) {
        addBotMessage(`Tekrar merhaba ${currentUserName}! Bizi hangi sosyal medya platformundan takip ediyorsun? (Instagram, EU Portal, X, Tiktok)`, 100);
        conversationState = 'awaiting_social';
    } else if (!currentSocialUser) {
        addBotMessage(`Harika, ${currentSocialMedia} üzerinden takip etmene sevindim! Oradaki kullanıcı adın nedir?`, 100);
        conversationState = 'awaiting_username';
    } else {
        addBotMessage(`Merhaba ${currentUserName}, tekrar hoş geldin! Kullanılabilir komutlar için /help yazabilirsin.`, 100);
        conversationState = 'idle'; 
    }
    setTimeout(scrollToBottom, 150); 
}


// Kullanıcı mesaj gönderme fonksiyonu (GÜNCELLENDİ - Komutlar eklendi)
function sendMessage() {
    const messageText = userInput.value.trim();

    if (messageText !== "") {
        addMessageToChatBox(messageText, 'user-message');
        userInput.value = ''; 

        // Konuşma durumuna göre işle
        if (conversationState === 'awaiting_name') {
            currentUserName = messageText; 
            saveData(USER_NAME_KEY, currentUserName); 
            startConversation(); // Bir sonraki adımı sor/başlat
        
        } else if (conversationState === 'awaiting_social') {
            const lowerCaseInput = messageText.toLowerCase();
            if (allowedSocialMedia.includes(lowerCaseInput)) {
                currentSocialMedia = lowerCaseInput; 
                saveData(SOCIAL_MEDIA_KEY, currentSocialMedia); 
                startConversation(); // Bir sonraki adımı sor/başlat
            } else {
                addBotMessage("Lütfen listedeki platformlardan birini yazar mısın? (Instagram, EU Portal, X, Tiktok)");
            }

        } else if (conversationState === 'awaiting_username') {
            currentSocialUser = messageText; 
            saveData(SOCIAL_USER_KEY, currentSocialUser); 
            addBotMessage(`Teşekkürler ${currentUserName}! Tüm bilgilerin kaydedildi.`);
            startConversation(); // Normal moda geç ve hoş geldin de
        
        } else if (conversationState === 'awaiting_reset_confirmation') {
            const lowerCaseInput = messageText.toLowerCase();
            if (lowerCaseInput === 'evet') {
                removeData(USER_NAME_KEY);
                removeData(SOCIAL_MEDIA_KEY);
                removeData(SOCIAL_USER_KEY);
                currentUserName = null;
                currentSocialMedia = null;
                currentSocialUser = null;
                addBotMessage("Tüm kayıtlı bilgilerin silindi.");
                conversationState = 'idle';
                // İsteğe bağlı olarak tekrar tanışma başlatılabilir:
                // setTimeout(startConversation, 800); 
            } else {
                addBotMessage("İşlem iptal edildi.");
                conversationState = 'idle';
            }

        } else { // conversationState === 'idle' (Normal sohbet/komut modu)
            
            // === YENİ: Komutları işle ===
            if (messageText.startsWith('/')) {
                const command = messageText.substring(1).toLowerCase().trim(); // / işaretini at, küçük harfe çevir

                switch (command) {
                    case 'help':
                        addBotMessage("Kullanılabilir Komutlar:\n/help - Bu yardım mesajını gösterir.\n/bilgilerim - Kayıtlı bilgilerini gösterir.\n/reset - Kayıtlı bilgilerini siler.");
                        break;
                    case 'bilgilerim':
                        let info = "Kayıtlı Bilgilerin:\n";
                        info += `İsim: ${currentUserName || 'Kaydedilmemiş'}\n`;
                        info += `Takip Edilen Platform: ${currentSocialMedia || 'Kaydedilmemiş'}\n`;
                        info += `Platform Kullanıcı Adı: ${currentSocialUser || 'Kaydedilmemiş'}`;
                        addBotMessage(info);
                        break;
                    case 'reset':
                        addBotMessage("Emin misin? Kayıtlı tüm bilgilerin (isim, sosyal medya, kullanıcı adı) silinecek. Onaylamak için 'Evet' yaz.");
                        conversationState = 'awaiting_reset_confirmation'; // Onay bekleme moduna geç
                        break;
                    default:
                        addBotMessage(`Bilinmeyen komut: "${command}". Yardım için /help yazabilirsin.`);
                }
            } 
            // ============================
            
            // Komut değilse, temel selamlaşmaları kontrol et
            else {
                const lowerCaseInput = messageText.toLowerCase();
                if (lowerCaseInput === 'merhaba' || lowerCaseInput === 'selam') {
                    addBotMessage(`Merhaba ${currentUserName || ''}!`); 
                } else if (lowerCaseInput === 'naber' || lowerCaseInput === 'nasılsın') {
                    addBotMessage("İyiyim, sorduğun için teşekkürler! Sen nasılsın?");
                } 
                // Diğer tüm durumlarda genel cevap
                else {
                    addBotMessage("Mesajınızı aldım!"); 
                }
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

// Sayfa yüklendiğinde konuşmayı başlat
startConversation();
