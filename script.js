// === DOMContentLoaded Olay Dinleyicisi Başlangıcı ===
document.addEventListener('DOMContentLoaded', () => {
    console.log(">>> Kyrosil Bot v155-FIXED (DOMContentLoaded) çalıştı! <<<");

    // Gerekli HTML elementlerini seçiyoruz
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    if (!chatBox || !userInput || !sendButton) {
        console.error("Hata: Gerekli HTML elementleri bulunamadı!");
        return;
    } else {
        console.log("HTML elementleri başarıyla bulundu.");
    }

    // localStorage için anahtar (key) tanımları
    const USER_NAME_KEY = 'kyrosil_userName';
    const SOCIAL_MEDIA_KEY = 'kyrosil_socialMedia';
    const SOCIAL_USER_KEY = 'kyrosil_socialUser';
    const TK_MILES_KEY = 'kyrosil_tkMiles';
    const MAVI_GSM_KEY = 'kyrosil_maviGsm';
    const CARREFOURSA_INFO_KEY = 'kyrosil_carrefoursaInfo';
    const SWISSAIR_NO_KEY = 'kyrosil_swissairNo';
    const CARREFOUR_EU_KEY = 'kyrosil_carrefourEu';
    const TIKTAK_GSM_KEY = 'kyrosil_tiktakGsm';
    const TRENDYOL_EMAIL_KEY = 'kyrosil_trendyolEmail';

    // Google Gemini API Ayarları
    const GEMINI_API_KEY = 'AIzaSyDiMIy8gM65-DWVlneXq4oKW4lCqwK0nK4'; // !!! KENDİ ANAHTARINI BURAYA YAPIŞTIR !!!
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

    // Değişkenler
    let conversationState = 'idle';
    const allowedSocialMedia = ['instagram', 'eu portal', 'x', 'tiktok'];
    let chatHistory = [];
    const MAX_HISTORY_LENGTH = 6;
    let currentUserName, currentSocialMedia, currentSocialUser;

    // --- localStorage Fonksiyonları ---
    function saveData(key, value) { try { localStorage.setItem(key, value); console.log(`localStorage'a kaydedildi: ${key} = ${value}`); } catch (e) { console.error("localStorage'a kaydederken hata oluştu:", e); } }
    function loadData(key) { try { const data = localStorage.getItem(key); return data; } catch (e) { console.error("localStorage'dan okurken hata oluştu:", e); return null; } }
    function removeData(key) { try { localStorage.removeItem(key); console.log(`localStorage'dan silindi: ${key}`); } catch (e) { console.error("localStorage'dan silerken hata oluştu:", e); } }
    function removeAllSponsorData() { removeData(TK_MILES_KEY); removeData(MAVI_GSM_KEY); removeData(CARREFOURSA_INFO_KEY); removeData(SWISSAIR_NO_KEY); removeData(CARREFOUR_EU_KEY); removeData(TIKTAK_GSM_KEY); removeData(TRENDYOL_EMAIL_KEY); }

    // Mesajı sohbet kutusuna ekleyen ve geçmişe kaydeden fonksiyon
    function addMessage(text, role) {
        const messageClass = role === 'user' ? 'user-message' : 'bot-message';
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', messageClass);
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        messageElement.appendChild(paragraph);
        if (chatBox) { chatBox.appendChild(messageElement); }
        else { console.error("addMessage içinde chatBox elementi bulunamadı!"); return; }
        if(role === 'user' || role === 'model') {
            chatHistory.push({ role: role, parts: [{ text: text }] });
            if (chatHistory.length > MAX_HISTORY_LENGTH) { chatHistory = chatHistory.slice(chatHistory.length - MAX_HISTORY_LENGTH); }
        }
        // console.log("Chat History:", JSON.stringify(chatHistory, null, 2)); // Debug için açılabilir
        scrollToBottom();
    }
    
    // Sadece ekrana mesaj ekleyen (geçmişe eklemeyen) fonksiyon
    function addMessageToChatBoxOnly(text, messageClass) {
         const messageElement = document.createElement('div');
         messageElement.classList.add('message', messageClass);
         const paragraph = document.createElement('p');
         paragraph.textContent = text;
         messageElement.appendChild(paragraph);
         if (chatBox) { chatBox.appendChild(messageElement); }
         else { console.error("addMessageToChatBoxOnly içinde chatBox elementi bulunamadı!"); return; }
         scrollToBottom();
    }


    // Bot mesajı ekleme ve gecikme fonksiyonu (addMessage kullanıyor)
    function addBotMessage(text, delay = 600) {
        setTimeout(() => {
            addMessage(text, 'model');
        }, delay);
    }

    // Sohbet kutusunu en alta kaydıran yardımcı fonksiyon
    function scrollToBottom() { if (chatBox) { chatBox.scrollTop = chatBox.scrollHeight; } }

    // Genel Cevap Fonksiyonu
     const genericReplies = ["Anladım.", "Hmm, peki.", "İlginç.", "Tamamdır.", "Devam et...", "Peki."];
     function getRandomGenericReply() { const randomIndex = Math.floor(Math.random() * genericReplies.length); return genericReplies[randomIndex]; }


    // Gemini API Fonksiyonu
    async function getGeminiResponse() {
        if (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].role !== 'user') { return; }
        
        addMessageToChatBoxOnly("...", 'bot-message'); // Thinking indicator (geçmişe eklemiyoruz)
        const thinkingMessageElement = chatBox.lastElementChild; 

        const payload = { contents: chatHistory };
        try {
            if (!GEMINI_API_KEY || GEMINI_API_KEY === 'SENIN_API_ANAHTARIN_BURAYA') { throw new Error("API Anahtarı ayarlanmamış veya geçersiz."); }
            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { const errorData = await response.json(); throw new Error(`API Hatası: ${response.status} - ${errorData?.error?.message || response.statusText}`); }
            const data = await response.json();
            let botReply = "Üzgünüm, bir cevap alamadım.";
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) { botReply = data.candidates[0].content.parts[0].text; }
            else if (data.promptFeedback && data.promptFeedback.blockReason){ botReply = `İçerik güvenlik nedeniyle engellendi: ${data.promptFeedback.blockReason}`; console.error("API İçerik Engeli:", data.promptFeedback); }
            else { console.error("Beklenmeyen API cevap formatı:", data); }

            if (thinkingMessageElement && thinkingMessageElement.classList.contains('bot-message') && thinkingMessageElement.textContent === "...") { thinkingMessageElement.remove(); } 
            addMessage(botReply, 'model'); // API cevabını hem ekrana hem geçmişe ekle

        } catch (error) {
            console.error("Gemini API isteği başarısız:", error);
            if (thinkingMessageElement && thinkingMessageElement.classList.contains('bot-message') && thinkingMessageElement.textContent === "...") { thinkingMessageElement.remove(); }
            addMessageToChatBoxOnly(`Üzgünüm, şu an sana cevap veremiyorum. Hata: ${error.message}`, 'bot-message'); // Hata mesajını geçmişe ekleme
        }
    }

    // === Konuşmayı başlatan veya devam ettiren DÜZELTİLMİŞ fonksiyon ===
    function startConversation() {
        console.log("--- startConversation FONKSIYONU ÇALIŞTI! (Versiyon #155 - DÜZELTİLDİ) ---");
        chatHistory = []; // Geçmişi temizle

        // === İLK KARŞILAMA MESAJINI BURADA addMessageToChatBoxOnly İLE EKLE ===
        // Bu fonksiyon mesajı sadece ekranda gösterir, konuşma geçmişine eklemez.
        console.log("İlk 'Avrupa...' mesajı addMessageToChatBoxOnly ile ekleniyor..."); 
        addMessageToChatBoxOnly("Avrupa'nın sponsor markalarla ilk ve tek tam entegre yapay zeka botu KyrosilRewards'a hoş geldin! ✨", 'bot-message');
        // ===================================================================

        // Sonraki adımı belirle ve addBotMessage ile (gecikmeli ve geçmişe ekleyerek) sor
        if (!currentUserName) {
            console.log("İsim sorulacak...");
            addBotMessage("Seninle tanışmak istiyorum, adın nedir?", 100);
            conversationState = 'awaiting_name';
        } else if (!currentSocialMedia) {
            console.log("Sosyal medya sorulacak...");
            addBotMessage(`Tekrar merhaba ${currentUserName}! Bizi hangi sosyal medya platformundan takip ediyorsun? (Instagram, EU Portal, X, Tiktok)`, 100);
            conversationState = 'awaiting_social';
        } else if (!currentSocialUser) {
            console.log("Kullanıcı adı sorulacak...");
            addBotMessage(`Harika, ${currentSocialMedia} üzerinden takip etmene sevindim! Oradaki kullanıcı adın nedir?`, 100);
            conversationState = 'awaiting_username';
        } else {
            console.log("Tekrar hoş geldin mesajı verilecek...");
            addBotMessage(`Tekrar hoş geldin, ${currentUserName}! Mevcut ödül fırsatları için /rewards, sponsor kayıtları için /sponsor-kayit yazabilirsin. Diğer komutlar için /help her zaman yanında. Ya da sadece sohbet edelim!`, 100);
            conversationState = 'idle';
        }
        
        setTimeout(scrollToBottom, 150); // İlk mesajlardan sonra kaydır
    }
    // ============================================================


    // Kullanıcı mesaj gönderme fonksiyonu
    function sendMessage() {
        if (!userInput) { console.error("sendMessage içinde userInput elementi bulunamadı!"); return; }
        const messageText = userInput.value.trim();
        if (messageText !== "") {
            addMessage(messageText, 'user'); // Kullanıcı mesajını ekle (geçmişe de)
            userInput.value = '';

            // State handling... (Bu kısım aynı)
            if (conversationState !== 'idle') {
                if(conversationState==='awaiting_name'){currentUserName=messageText;saveData(USER_NAME_KEY,currentUserName);startConversation()}else if(conversationState==='awaiting_social'){const lci=messageText.toLowerCase();if(allowedSocialMedia.includes(lci)){currentSocialMedia=lci;saveData(SOCIAL_MEDIA_KEY,currentSocialMedia);startConversation()}else{addBotMessage("Lütfen listedeki platformlardan birini yazar mısın? (Instagram, EU Portal, X, Tiktok)")}}else if(conversationState==='awaiting_username'){currentSocialUser=messageText;saveData(SOCIAL_USER_KEY,currentSocialUser);addBotMessage(`Teşekkürler ${currentUserName}! Tüm bilgilerin kaydedildi.`);startConversation()}else if(conversationState==='awaiting_reset_confirmation'){const lci=messageText.toLowerCase();if(lci==='evet'){removeData(USER_NAME_KEY);removeData(SOCIAL_MEDIA_KEY);removeData(SOCIAL_USER_KEY);removeAllSponsorData();currentUserName=null;currentSocialMedia=null;currentSocialUser=null;addBotMessage("Tüm kayıtlı bilgilerin (tanışma ve sponsor) silindi.");conversationState='idle';setTimeout(startConversation,800)}else{addBotMessage("İşlem iptal edildi.");conversationState='idle'}}else if(conversationState==='awaiting_tk_no'){const tkNo=messageText;saveData(TK_MILES_KEY,tkNo);/*currentTkMiles=tkNo;*/addBotMessage(`Miles&Smiles (${tkNo}) kaydınız alındı. Özel teklifler için takipte kalın!`);conversationState='idle'}else if(conversationState==='awaiting_mavi_gsm'){const maviGsm=messageText;saveData(MAVI_GSM_KEY,maviGsm);/*currentMaviGsm=maviGsm;*/addBotMessage(`Mavi Kartuş (${maviGsm}) GSM kaydınız alındı. Kampanyalardan haberdar edileceksiniz!`);conversationState='idle'}else if(conversationState==='awaiting_carrefoursa_info'){const csInfo=messageText;saveData(CARREFOURSA_INFO_KEY,csInfo);/*currentCarrefoursaInfo=csInfo;*/addBotMessage(`CarrefourSA (${csInfo}) bilginiz kaydedildi. İlgili kampanyalar hakkında bilgi verilecek!`);conversationState='idle'}else if(conversationState==='awaiting_swissair_no'){const swissNo=messageText;saveData(SWISSAIR_NO_KEY,swissNo);/*currentSwissairNo=swissNo;*/addBotMessage(`Swiss Air (${swissNo}) yolcu programı kaydınız alındı. Uçuşlarınızda başarılar!`);conversationState='idle'}else if(conversationState==='awaiting_carrefour_eu'){const cEuNo=messageText;saveData(CARREFOUR_EU_KEY,cEuNo);/*currentCarrefourEu=cEuNo;*/addBotMessage(`Carrefour Avrupa (${cEuNo}) kart bilginiz kaydedildi. Bölgesel kampanyalar için takipte kalın!`);conversationState='idle'}else if(conversationState==='awaiting_tiktak_gsm'){const tiktakGsm=messageText;saveData(TIKTAK_GSM_KEY,tiktakGsm);/*currentTiktakGsm=tiktakGsm;*/addBotMessage(`TikTak (${tiktakGsm}) GSM kaydınız alındı. Kullanımlarınızda bol şans!`);conversationState='idle'}else if(conversationState==='awaiting_trendyol_email'){const trendyolMail=messageText;saveData(TRENDYOL_EMAIL_KEY,trendyolMail);/*currentTrendyolEmail=trendyolMail;*/addBotMessage(`Trendyol (${trendyolMail}) e-posta adresiniz kaydedildi. Özel indirimler için hesabınızı kontrol edin!`);conversationState='idle'}else if(conversationState==='awaiting_carrefour_no'){const enteredNumber=messageText;addBotMessage(`Katılımınız alındı! Girdiğiniz numara (${enteredNumber}) için kısa süre içerisinde otomatik sistemlerimiz kartınıza 300 TL değerindeki Algida puanını tanımlayacaktır.`);conversationState='idle'}
            
            } else { // conversationState === 'idle'
                if (messageText.startsWith('/')) {
                    // Komut işleme
                    const command = messageText.substring(1).toLowerCase().trim(); let commandHandled = true;
                    switch (command) {
                         case 'help': addBotMessage("Kullanılabilir Komutlar:\n/help - Yardım.\n/bilgilerim - Bilgilerini gösterir.\n/reset - Bilgilerini siler.\n/sponsor-kayit - Sponsor komutları.\n/rewards - Ödül fırsatları."); break; 
                         case 'sponsor-kayit': addBotMessage("Sponsor Kayıtları:\n/turkishairlines - M&S No\n/mavi - Mavi GSM\n/carrefoursa - C.SA Kart/GSM\n/swissair - Swiss Air No\n/carrefour - C. EU Kart\n/tiktak - TikTak GSM\n/trendyol - Trendyol E-posta"); break;
                         case 'rewards': let rewardsText = "Aktif Ödül Fırsatı:\n"; rewardsText += "- CarrefourSA & Algida: 300TL Değerinde Puan Fırsatı! (/carrefoursaxalgida)"; addBotMessage(rewardsText); break;
                         case 'bilgilerim': let currentTkMiles,currentMaviGsm,currentCarrefoursaInfo,currentSwissairNo,currentCarrefourEu,currentTiktakGsm,currentTrendyolEmail; currentUserName=loadData(USER_NAME_KEY);currentSocialMedia=loadData(SOCIAL_MEDIA_KEY);currentSocialUser=loadData(SOCIAL_USER_KEY);currentTkMiles=loadData(TK_MILES_KEY);currentMaviGsm=loadData(MAVI_GSM_KEY);currentCarrefoursaInfo=loadData(CARREFOURSA_INFO_KEY);currentSwissairNo=loadData(SWISSAIR_NO_KEY);currentCarrefourEu=loadData(CARREFOUR_EU_KEY);currentTiktakGsm=loadData(TIKTAK_GSM_KEY);currentTrendyolEmail=loadData(TRENDYOL_EMAIL_KEY);let info="--- Temel Bilgilerin ---\n"; info+=`İsim: ${currentUserName||'-'}\n`; info+=`Platform: ${currentSocialMedia||'-'}\n`; info+=`K.Adı: ${currentSocialUser||'-'}\n`; info+="--- Sponsor Kayıtların ---\n"; info+=`THY (M&S): ${currentTkMiles||'-'}\n`; info+=`Mavi (GSM): ${currentMaviGsm||'-'}\n`; info+=`C.SA (Kart/GSM): ${currentCarrefoursaInfo||'-'}\n`; info+=`Swiss Air (No): ${currentSwissairNo||'-'}\n`; info+=`C. EU (Kart): ${currentCarrefourEu||'-'}\n`; info+=`TikTak (GSM): ${currentTiktakGsm||'-'}\n`; info+=`Trendyol (Mail): ${currentTrendyolEmail||'-'}`; addBotMessage(info); break;
                         case 'reset': addBotMessage("Emin misin? Kayıtlı tüm bilgilerin (tanışma ve sponsor) silinecek. Onaylamak için 'Evet' yaz."); conversationState = 'awaiting_reset_confirmation'; break;
                         case 'turkishairlines': addBotMessage("Lütfen Miles&Smiles üyelik numaranızı (TK ile başlayan) girin:"); conversationState = 'awaiting_tk_no'; break;
                         case 'mavi': addBotMessage("Lütfen Mavi Kartuş Kart'a kayıtlı GSM numaranızı girin:"); conversationState = 'awaiting_mavi_gsm'; break;
                         case 'carrefoursa': addBotMessage("Lütfen CarrefourSA kart numaranızı veya kayıtlı GSM numaranızı girin:"); conversationState = 'awaiting_carrefoursa_info'; break;
                         case 'swissair': addBotMessage("Lütfen Swiss Air özel yolcu programı numaranızı girin:"); conversationState = 'awaiting_swissair_no'; break;
                         case 'carrefour': addBotMessage("Lütfen Carrefour Card (Avrupa) numaranızı girin:"); conversationState = 'awaiting_carrefour_eu'; break;
                         case 'tiktak': addBotMessage("Lütfen TikTak'a kayıtlı GSM numaranızı girin:"); conversationState = 'awaiting_tiktak_gsm'; break;
                         case 'trendyol': addBotMessage("Lütfen Trendyol'a kayıtlı e-posta adresinizi girin:"); conversationState = 'awaiting_trendyol_email'; break;
                         case 'carrefoursaxalgida': addBotMessage("Lütfen CarrefourSA Kart'a kayıtlı GSM numaranızı veya Kart numaranızı girin (Algida Kampanyası):"); conversationState = 'awaiting_carrefour_no'; break;
                        default: addBotMessage(`Bilinmeyen komut: "${command}". Yardım için /help veya /sponsor-kayit yazabilirsin.`); commandHandled = false;
                    }
                    if (commandHandled) return;
                }
                else { // Komut değilse normal sohbet
                    const lowerCaseInput = messageText.toLowerCase();
                    let greetingHandled = true;
                    if (lowerCaseInput === 'merhaba' || lowerCaseInput === 'selam') { addBotMessage(`Merhaba ${currentUserName || ''}!`); }
                    else if (lowerCaseInput === 'naber' || lowerCaseInput === 'nasılsın') { addBotMessage("İyiyim, sorduğun için teşekkürler! Sen nasılsın?"); }
                    else { greetingHandled = false; }

                    if (!greetingHandled) {
                        if (typeof GEMINI_API_KEY !== 'undefined' && GEMINI_API_KEY && GEMINI_API_KEY !== 'SENIN_API_ANAHTARIN_BURAYA') {
                             getGeminiResponse(); // API'yi çağır
                        } else {
                             addBotMessage(getRandomGenericReply()); // API yoksa rastgele cevap
                        }
                    }
                }
            }
        }
    }

    // === Olay Dinleyicileri ===
    if (sendButton) { sendButton.addEventListener('click', sendMessage); }
    if (userInput) { userInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') { sendMessage(); } }); }

    // === Başlangıç ===
    // localStorage'dan verileri yükle ve konuşmayı başlat
    currentUserName = loadData(USER_NAME_KEY);
    currentSocialMedia = loadData(SOCIAL_MEDIA_KEY);
    currentSocialUser = loadData(SOCIAL_USER_KEY);
    startConversation(); // Konuşmayı başlat

}); // === DOMContentLoaded Olay Dinleyicisi Sonu ===
