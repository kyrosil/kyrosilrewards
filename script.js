// Gerekli HTML elementlerini seçiyoruz
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// localStorage için anahtar (key) tanımları
const USER_NAME_KEY = 'kyrosil_userName';
const SOCIAL_MEDIA_KEY = 'kyrosil_socialMedia';
const SOCIAL_USER_KEY = 'kyrosil_socialUser';

// === YENİ: Google Gemini API Ayarları ===
const GEMINI_API_KEY = 'AIzaSyDKAlH4qmyd2m-qQ9Bx6DvMFvkvNs74cts'; // !!! KENDİ ANAHTARINI BURAYA YAPIŞTIR !!!
// Model adı değişebilir (örn: 'gemini-pro'). Gemini dokümantasyonuna veya AI Studio'ya bak.
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY; 
// =======================================

// Konuşma durumunu takip etmek için değişken
let conversationState = 'idle'; 

// İzin verilen sosyal medya platformları
const allowedSocialMedia = ['instagram', 'eu portal', 'x', 'tiktok'];

// --- localStorage Fonksiyonları (Değişiklik yok) ---
function saveData(key, value) { /* ... önceki kod ... */ }
function loadData(key) { /* ... önceki kod ... */ }
function removeData(key) { /* ... önceki kod ... */ }
// --- (Fonksiyonların içini kısa tutmak için açmadım, önceki kodla aynı) ---
function saveData(key, value){try{localStorage.setItem(key, value);console.log(`localStorage'a kaydedildi: ${key} = ${value}`)}catch(e){console.error("localStorage'a kaydederken hata oluştu:",e)}}
function loadData(key){try{const data=localStorage.getItem(key);return data}catch(e){console.error("localStorage'dan okurken hata oluştu:",e);return null}}
function removeData(key){try{localStorage.removeItem(key);console.log(`localStorage'dan silindi: ${key}`)}catch(e){console.error("localStorage'dan silerken hata oluştu:",e)}}

// Sayfa yüklendiğinde mevcut verileri yükle
let currentUserName = loadData(USER_NAME_KEY);
let currentSocialMedia = loadData(SOCIAL_MEDIA_KEY);
let currentSocialUser = loadData(SOCIAL_USER_KEY);

// Mesajı sohbet kutusuna ekleyen yardımcı fonksiyon
function addMessageToChatBox(text, messageClass) { /* ... önceki kod ... */ }
function addMessageToChatBox(text, messageClass){const messageElement=document.createElement('div');messageElement.classList.add('message', messageClass);const paragraph=document.createElement('p');paragraph.textContent=text;messageElement.appendChild(paragraph);chatBox.appendChild(messageElement);scrollToBottom()}

// Bot mesajı ekleme ve gecikme fonksiyonu
function addBotMessage(text, delay = 600) { /* ... önceki kod ... */ }
function addBotMessage(text, delay = 600){setTimeout(()=>{addMessageToChatBox(text,'bot-message')},delay)}

// Sohbet kutusunu en alta kaydıran yardımcı fonksiyon
function scrollToBottom() { /* ... önceki kod ... */ }
function scrollToBottom(){chatBox.scrollTop=chatBox.scrollHeight}

// Konuşmayı başlatan veya devam ettiren fonksiyon
function startConversation() { /* ... önceki kod ... */ }
function startConversation(){if(!currentUserName){addBotMessage("Merhaba! Ben Kyrosilrewards botuyum. Seninle tanışmak istiyorum, adın nedir?",100);conversationState='awaiting_name'}else if(!currentSocialMedia){addBotMessage(`Tekrar merhaba ${currentUserName}! Bizi hangi sosyal medya platformundan takip ediyorsun? (Instagram, EU Portal, X, Tiktok)`,100);conversationState='awaiting_social'}else if(!currentSocialUser){addBotMessage(`Harika, ${currentSocialMedia} üzerinden takip etmene sevindim! Oradaki kullanıcı adın nedir?`,100);conversationState='awaiting_username'}else{addBotMessage(`Merhaba ${currentUserName}, tekrar hoş geldin! Kullanılabilir komutlar için /help yazabilirsin.`,100);conversationState='idle'}setTimeout(scrollToBottom,150)}


// === YENİ: Gemini API'sine istek gönderip cevap alan fonksiyon ===
async function getGeminiResponse(prompt) {
    // Botun 'yazıyor...' gibi görünmesini sağlayabiliriz (isteğe bağlı)
    addBotMessage("...", 100); // Çok hızlı bir '...' mesajı

    // API'ye gönderilecek veri yapısı (curl örneğindeki gibi)
    const payload = {
        contents: [{
            parts: [{"text": prompt}]
        }]
        // generationConfig ve safetySettings gibi ek ayarlar buraya eklenebilir
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload) // JavaScript objesini JSON string'ine çevir
        });

        // Cevap başarılı değilse hata fırlat
        if (!response.ok) {
            const errorData = await response.json(); // Hata detayını almaya çalış
            throw new Error(`API Hatası: ${response.status} - ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json(); // Cevabı JSON olarak işle

        // Cevabın yapısını kontrol et ve metni çıkar (Bu yapı Gemini modeline göre değişebilir!)
        let botReply = "Üzgünüm, bir cevap alamadım."; // Varsayılan hata mesajı
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            botReply = data.candidates[0].content.parts[0].text;
        } else {
             console.error("Beklenmeyen API cevap formatı:", data);
        }

        // En son eklenen '...' mesajını silip yerine API cevabını koyalım
        const thinkingMessage = chatBox.querySelector('.bot-message:last-child');
        if (thinkingMessage && thinkingMessage.textContent === "...") {
             thinkingMessage.querySelector('p').textContent = botReply; // '...' yerine cevabı yaz
        } else {
             // Eğer '...' bulunamazsa veya başka bir mesaj araya girdiyse yeni mesaj ekle
             addMessageToChatBox(botReply, 'bot-message'); 
        }
        scrollToBottom(); // Kaydırmayı tekrar yap

    } catch (error) {
        console.error("Gemini API isteği başarısız:", error);
        addBotMessage("Üzgünüm, şu an sana cevap veremiyorum. Bir hata oluştu.");
    }
}
// ==================================================================


// Kullanıcı mesaj gönderme fonksiyonu (GÜNCELLENDİ - API çağrısı eklendi)
function sendMessage() {
    const messageText = userInput.value.trim();

    if (messageText !== "") {
        addMessageToChatBox(messageText, 'user-message');
        userInput.value = '';

        // Konuşma durumuna göre işle (onboarding, reset onayı)
        if (conversationState === 'awaiting_name' || conversationState === 'awaiting_social' || conversationState === 'awaiting_username' || conversationState === 'awaiting_reset_confirmation' || conversationState === 'awaiting_carrefour_no') {
           // Bu bloklarda değişiklik yok, önceki kod geçerli...
           // Sadece case 'awaiting_carrefour_no' içindeki addBotMessage çağrısı güncellendi (Simülasyon yazısı yok)
           if(conversationState==='awaiting_name'){currentUserName=messageText;saveData(USER_NAME_KEY,currentUserName);startConversation()}else if(conversationState==='awaiting_social'){const lci=messageText.toLowerCase();if(allowedSocialMedia.includes(lci)){currentSocialMedia=lci;saveData(SOCIAL_MEDIA_KEY,currentSocialMedia);startConversation()}else{addBotMessage("Lütfen listedeki platformlardan birini yazar mısın? (Instagram, EU Portal, X, Tiktok)")}}else if(conversationState==='awaiting_username'){currentSocialUser=messageText;saveData(SOCIAL_USER_KEY,currentSocialUser);addBotMessage(`Teşekkürler ${currentUserName}! Tüm bilgilerin kaydedildi.`);startConversation()}else if(conversationState==='awaiting_reset_confirmation'){const lci=messageText.toLowerCase();if(lci==='evet'){removeData(USER_NAME_KEY);removeData(SOCIAL_MEDIA_KEY);removeData(SOCIAL_USER_KEY);currentUserName=null;currentSocialMedia=null;currentSocialUser=null;addBotMessage("Tüm kayıtlı bilgilerin silindi.");conversationState='idle'}else{addBotMessage("İşlem iptal edildi.");conversationState='idle'}}else if(conversationState==='awaiting_carrefour_no'){const num=messageText;addBotMessage(`Katılımınız alındı! Girdiğiniz numara (${num}) için kısa süre içerisinde otomatik sistemlerimiz kartınıza 300 TL değerindeki Algida puanını tanımlayacaktır.`);conversationState='idle'}
        } else { // conversationState === 'idle' (Normal sohbet/komut modu)
            if (messageText.startsWith('/')) {
                // Komut işleme (Değişiklik yok)
                const command = messageText.substring(1).toLowerCase().trim(); 
                switch (command) {
                    case 'help': /* ... önceki kod ... */ addBotMessage("Kullanılabilir Komutlar:\n/help - Bu yardım mesajını gösterir.\n/bilgilerim - Kayıtlı bilgilerini gösterir.\n/reset - Kayıtlı bilgilerini siler.\n/carrefoursaxalgida - CarrefourSA & Algida kampanyasına katılım."); break;
                    case 'bilgilerim': /* ... önceki kod ... */ let info = "Kayıtlı Bilgilerin:\n"; info += `İsim: ${currentUserName || 'Kaydedilmemiş'}\n`; info += `Takip Edilen Platform: ${currentSocialMedia || 'Kaydedilmemiş'}\n`; info += `Platform Kullanıcı Adı: ${currentSocialUser || 'Kaydedilmemiş'}`; addBotMessage(info); break;
                    case 'reset': /* ... önceki kod ... */ addBotMessage("Emin misin? Kayıtlı tüm bilgilerin (isim, sosyal medya, kullanıcı adı) silinecek. Onaylamak için 'Evet' yaz."); conversationState = 'awaiting_reset_confirmation'; break;
                    case 'carrefoursaxalgida': /* ... önceki kod ... */ addBotMessage("Lütfen CarrefourSA Kart'a kayıtlı GSM numaranızı veya Kart numaranızı girin:"); conversationState = 'awaiting_carrefour_no'; break;
                    default: addBotMessage(`Bilinmeyen komut: "${command}". Yardım için /help yazabilirsin.`);
                }
            }
            else { // Komut değilse, temel selamlaşma veya API çağrısı
                const lowerCaseInput = messageText.toLowerCase();
                if (lowerCaseInput === 'merhaba' || lowerCaseInput === 'selam') {
                    addBotMessage(`Merhaba ${currentUserName || ''}!`);
                } else if (lowerCaseInput === 'naber' || lowerCaseInput === 'nasılsın') {
                    addBotMessage("İyiyim, sorduğun için teşekkürler! Sen nasılsın?");
                }
                // === YENİ: Diğer tüm durumlarda API'yi çağır ===
                else {
                    // Standart cevabı vermek yerine Gemini'ye soralım
                    getGeminiResponse(messageText); 
                }
                // ========================================
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
