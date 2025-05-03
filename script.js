// Gerekli HTML elementlerini seçiyoruz
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// localStorage için anahtar (key) tanımları
const USER_NAME_KEY = 'kyrosil_userName';
const SOCIAL_MEDIA_KEY = 'kyrosil_socialMedia';
const SOCIAL_USER_KEY = 'kyrosil_socialUser';
// const CARREFOUR_INFO_KEY = 'kyrosil_carrefourInfo'; // İstersek numarayı da kaydedebiliriz

// Konuşma durumunu takip etmek için değişken
let conversationState = 'idle'; // Olası durumlar: 'idle', 'awaiting_name', 'awaiting_social', 'awaiting_username', 'awaiting_reset_confirmation', 'awaiting_carrefour_no'

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

// localStorage'dan veri silme fonksiyonu
function removeData(key) {
     try {
        localStorage.removeItem(key);
        console.log(`localStorage'dan silindi: ${key}`);
    } catch (e) {
        console.error("localStorage'dan silerken hata oluştu:", e);
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


// Kullanıcı mesaj gönderme fonksiyonu (GÜNCELLENDİ - Simülasyon yazısı kaldırıldı)
function sendMessage() {
    const messageText = userInput.value.trim();

    if (messageText !== "") {
        addMessageToChatBox(messageText, 'user-message');
        userInput.value = '';

        // Konuşma durumuna göre işle
        if (conversationState === 'awaiting_name') {
            currentUserName = messageText;
            saveData(USER_NAME_KEY, currentUserName);
            startConversation();

        } else if (conversationState === 'awaiting_social') {
            const lowerCaseInput = messageText.toLowerCase();
            if (allowedSocialMedia.includes(lowerCaseInput)) {
                currentSocialMedia = lowerCaseInput;
                saveData(SOCIAL_MEDIA_KEY, currentSocialMedia);
                startConversation();
            } else {
                addBotMessage("Lütfen listedeki platformlardan birini yazar mısın? (Instagram, EU Portal, X, Tiktok)");
            }

        } else if (conversationState === 'awaiting_username') {
            currentSocialUser = messageText;
            saveData(SOCIAL_USER_KEY, currentSocialUser);
            addBotMessage(`Teşekkürler ${currentUserName}! Tüm bilgilerin kaydedildi.`);
            startConversation();

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
            } else {
                addBotMessage("İşlem iptal edildi.");
                conversationState = 'idle';
            }
        } else if (conversationState === 'awaiting_carrefour_no') {
            const enteredNumber = messageText;
            // === SİMÜLASYON YAZISI KALDIRILDI ===
            addBotMessage(`Katılımınız alındı! Girdiğiniz numara (${enteredNumber}) için kısa süre içerisinde otomatik sistemlerimiz kartınıza 300 TL değerindeki Algida puanını tanımlayacaktır.`);
            // ==================================
            conversationState = 'idle'; // Normal moda dön

        } else { // conversationState === 'idle' (Normal sohbet/komut modu)

            if (messageText.startsWith('/')) {
                const command = messageText.substring(1).toLowerCase().trim();

                switch (command) {
                    case 'help':
                        addBotMessage("Kullanılabilir Komutlar:\n/help - Bu yardım mesajını gösterir.\n/bilgilerim - Kayıtlı bilgilerini gösterir.\n/reset - Kayıtlı bilgilerini siler.\n/carrefoursaxalgida - CarrefourSA & Algida kampanyasına katılım.");
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
                        conversationState = 'awaiting_reset_confirmation';
                        break;
                    case 'carrefoursaxalgida':
                        addBotMessage("Lütfen CarrefourSA Kart'a kayıtlı GSM numaranızı veya Kart numaranızı girin:");
                        conversationState = 'awaiting_carrefour_no';
                        break;
                    default:
                        addBotMessage(`Bilinmeyen komut: "${command}". Yardım için /help yazabilirsin.`);
                }
            }
            else { // Komut değilse normal sohbet
                const lowerCaseInput = messageText.toLowerCase();
                if (lowerCaseInput === 'merhaba' || lowerCaseInput === 'selam') {
                    addBotMessage(`Merhaba ${currentUserName || ''}!`);
                } else if (lowerCaseInput === 'naber' || lowerCaseInput === 'nasılsın') {
                    addBotMessage("İyiyim, sorduğun için teşekkürler! Sen nasılsın?");
                }
                else { // Diğer tüm durumlarda genel cevap
                    addBotMessage("Şu an sadece belirli komutlara ve selamlaşmalara cevap verebiliyorum. Yardım için /help yazabilirsin.");
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
