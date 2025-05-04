// Gerekli HTML elementlerini seçiyoruz
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

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

// === YENİ: Hugging Face API Ayarları ===
const HF_TOKEN = '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'; // !!! KENDİ hf_... TOKEN'INI BURAYA YAPIŞTIR !!!
const HF_MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.2'; // Deneyeceğimiz model
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`;
// ====================================

// Konuşma durumunu takip etmek için değişken
let conversationState = 'idle';

// İzin verilen sosyal medya platformları
const allowedSocialMedia = ['instagram', 'eu portal', 'x', 'tiktok'];

// --- localStorage Fonksiyonları ---
function saveData(key, value) { try { localStorage.setItem(key, value); console.log(`localStorage'a kaydedildi: ${key} = ${value}`); } catch (e) { console.error("localStorage'a kaydederken hata oluştu:", e); } }
function loadData(key) { try { const data = localStorage.getItem(key); return data; } catch (e) { console.error("localStorage'dan okurken hata oluştu:", e); return null; } }
function removeData(key) { try { localStorage.removeItem(key); console.log(`localStorage'dan silindi: ${key}`); } catch (e) { console.error("localStorage'dan silerken hata oluştu:", e); } }
function removeAllSponsorData() { removeData(TK_MILES_KEY); removeData(MAVI_GSM_KEY); removeData(CARREFOURSA_INFO_KEY); removeData(SWISSAIR_NO_KEY); removeData(CARREFOUR_EU_KEY); removeData(TIKTAK_GSM_KEY); removeData(TRENDYOL_EMAIL_KEY); }

// Sayfa yüklendiğinde mevcut verileri yükle
let currentUserName = loadData(USER_NAME_KEY);
let currentSocialMedia = loadData(SOCIAL_MEDIA_KEY);
let currentSocialUser = loadData(SOCIAL_USER_KEY);

// Mesajı sohbet kutusuna ekleyen yardımcı fonksiyon
function addMessageToChatBox(text, messageClass) { const messageElement = document.createElement('div'); messageElement.classList.add('message', messageClass); const paragraph = document.createElement('p'); paragraph.textContent = text; messageElement.appendChild(paragraph); chatBox.appendChild(messageElement); scrollToBottom(); }

// Bot mesajı ekleme ve gecikme fonksiyonu
function addBotMessage(text, delay = 600) { setTimeout(() => { addMessageToChatBox(text, 'bot-message'); }, delay); }

// Sohbet kutusunu en alta kaydıran yardımcı fonksiyon
function scrollToBottom() { chatBox.scrollTop = chatBox.scrollHeight; }

// Konuşmayı başlatan veya devam ettiren fonksiyon
function startConversation() {
    if (!currentUserName) { addBotMessage("Avrupa'nın sponsor markalarla ilk ve tek tam entegre yapay zeka botu KyrosilRewards'a hoş geldin! ✨ Seninle tanışmak istiyorum, adın nedir?", 100); conversationState = 'awaiting_name'; }
    else if (!currentSocialMedia) { addBotMessage(`Tekrar merhaba ${currentUserName}! Bizi hangi sosyal medya platformundan takip ediyorsun? (Instagram, EU Portal, X, Tiktok)`, 100); conversationState = 'awaiting_social'; }
    else if (!currentSocialUser) { addBotMessage(`Harika, ${currentSocialMedia} üzerinden takip etmene sevindim! Oradaki kullanıcı adın nedir?`, 100); conversationState = 'awaiting_username'; }
    else { addBotMessage(`Tekrar hoş geldin, ${currentUserName}! Mevcut ödül fırsatları için /rewards, sponsor kayıtları için /sponsor-kayit yazabilirsin. Diğer komutlar için /help her zaman yanında. Ya da sadece sohbet edelim!`, 100); conversationState = 'idle'; }
    setTimeout(scrollToBottom, 150);
}

// === YENİ: Hugging Face API'sine istek gönderip cevap alan fonksiyon ===
async function getHuggingFaceResponse(prompt) {
    addBotMessage("...", 100); // Thinking indicator

    // API'ye gönderilecek veri yapısı
    const payload = {
        inputs: prompt,
        parameters: {
            max_new_tokens: 250,    // Cevap uzunluğu limiti
            temperature: 0.7,      // Cevap çeşitliliği (daha düşük = daha deterministik)
            return_full_text: false // Sadece üretilen cevabı döndür
        }
    };

    try {
        if (!HF_TOKEN || HF_TOKEN === 'SENIN_HF_TOKENIN_BURAYA') {
            throw new Error("Hugging Face Token ayarlanmamış veya geçersiz.");
        }

        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`, // Bearer Token kullanımı
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
             // Model yükleniyor olabilir (ilk istekte sıkça olur)
             if (response.status === 503) {
                 addBotMessage("Model şu an yükleniyor, lütfen birkaç saniye sonra tekrar deneyin...", 0);
                 // '...' mesajını silelim
                 const thinkingMessage = chatBox.querySelector('.bot-message:last-child');
                 if (thinkingMessage && thinkingMessage.textContent === "...") { thinkingMessage.remove(); }
                 return; // Fonksiyondan çık
             }
            // Diğer hatalar
            const errorData = await response.json();
            throw new Error(`API Hatası: ${response.status} - ${errorData?.error || response.statusText}`);
        }

        const data = await response.json();

        let botReply = "Üzgünüm, bir cevap alamadım.";
        // Cevap formatı genellikle [{ "generated_text": "..." }] şeklindedir
        if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            botReply = data[0].generated_text.trim(); // Baştaki/sondaki boşlukları al
        } else {
             console.error("Beklenmeyen API cevap formatı (Hugging Face):", data);
        }

        // '...' mesajını güncelle veya yeni mesaj ekle
        const thinkingMessage = chatBox.querySelector('.bot-message:last-child');
        if (thinkingMessage && thinkingMessage.textContent === "...") {
             thinkingMessage.querySelector('p').textContent = botReply;
        } else {
             addMessageToChatBox(botReply, 'bot-message');
        }
        scrollToBottom();

    } catch (error) {
        console.error("Hugging Face API isteği başarısız:", error);
        addBotMessage(`Üzgünüm, şu an sana cevap veremiyorum. Hata: ${error.message}`);
        const thinkingMessage = chatBox.querySelector('.bot-message:last-child');
        if (thinkingMessage && thinkingMessage.textContent === "...") { thinkingMessage.remove(); }
    }
}
// ====================================================================


// Kullanıcı mesaj gönderme fonksiyonu (GÜNCELLENDİ - API çağrısı HF'e göre)
function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText !== "") {
        addMessageToChatBox(messageText, 'user-message');
        userInput.value = '';

        // State handling (onboarding, reset, sponsor info)
        if (conversationState !== 'idle') {
            // Önceki state handler'lar aynı...
             if(conversationState==='awaiting_name'){currentUserName=messageText;saveData(USER_NAME_KEY,currentUserName);startConversation()}else if(conversationState==='awaiting_social'){const lci=messageText.toLowerCase();if(allowedSocialMedia.includes(lci)){currentSocialMedia=lci;saveData(SOCIAL_MEDIA_KEY,currentSocialMedia);startConversation()}else{addBotMessage("Lütfen listedeki platformlardan birini yazar mısın? (Instagram, EU Portal, X, Tiktok)")}}else if(conversationState==='awaiting_username'){currentSocialUser=messageText;saveData(SOCIAL_USER_KEY,currentSocialUser);addBotMessage(`Teşekkürler ${currentUserName}! Tüm bilgilerin kaydedildi.`);startConversation()}else if(conversationState==='awaiting_reset_confirmation'){const lci=messageText.toLowerCase();if(lci==='evet'){removeData(USER_NAME_KEY);removeData(SOCIAL_MEDIA_KEY);removeData(SOCIAL_USER_KEY);removeAllSponsorData();currentUserName=null;currentSocialMedia=null;currentSocialUser=null;addBotMessage("Tüm kayıtlı bilgilerin (tanışma ve sponsor) silindi.");conversationState='idle';setTimeout(startConversation,800)}else{addBotMessage("İşlem iptal edildi.");conversationState='idle'}}else if(conversationState==='awaiting_tk_no'){const tkNo=messageText;saveData(TK_MILES_KEY,tkNo);currentTkMiles=tkNo;addBotMessage(`Miles&Smiles (${tkNo}) kaydınız alındı. Özel teklifler için takipte kalın!`);conversationState='idle'}else if(conversationState==='awaiting_mavi_gsm'){const maviGsm=messageText;saveData(MAVI_GSM_KEY,maviGsm);currentMaviGsm=maviGsm;addBotMessage(`Mavi Kartuş (${maviGsm}) GSM kaydınız alındı. Kampanyalardan haberdar edileceksiniz!`);conversationState='idle'}else if(conversationState==='awaiting_carrefoursa_info'){const csInfo=messageText;saveData(CARREFOURSA_INFO_KEY,csInfo);currentCarrefoursaInfo=csInfo;addBotMessage(`CarrefourSA (${csInfo}) bilginiz kaydedildi. İlgili kampanyalar hakkında bilgi verilecek!`);conversationState='idle'}else if(conversationState==='awaiting_swissair_no'){const swissNo=messageText;saveData(SWISSAIR_NO_KEY,swissNo);currentSwissairNo=swissNo;addBotMessage(`Swiss Air (${swissNo}) yolcu programı kaydınız alındı. Uçuşlarınızda başarılar!`);conversationState='idle'}else if(conversationState==='awaiting_carrefour_eu'){const cEuNo=messageText;saveData(CARREFOUR_EU_KEY,cEuNo);currentCarrefourEu=cEuNo;addBotMessage(`Carrefour Avrupa (${cEuNo}) kart bilginiz kaydedildi. Bölgesel kampanyalar için takipte kalın!`);conversationState='idle'}else if(conversationState==='awaiting_tiktak_gsm'){const tiktakGsm=messageText;saveData(TIKTAK_GSM_KEY,tiktakGsm);currentTiktakGsm=tiktakGsm;addBotMessage(`TikTak (${tiktakGsm}) GSM kaydınız alındı. Kullanımlarınızda bol şans!`);conversationState='idle'}else if(conversationState==='awaiting_trendyol_email'){const trendyolMail=messageText;saveData(TRENDYOL_EMAIL_KEY,trendyolMail);currentTrendyolEmail=trendyolMail;addBotMessage(`Trendyol (${trendyolMail}) e-posta adresiniz kaydedildi. Özel indirimler için hesabınızı kontrol edin!`);conversationState='idle'}else if(conversationState==='awaiting_carrefour_no'){const enteredNumber=messageText;addBotMessage(`Katılımınız alındı! Girdiğiniz numara (${enteredNumber}) için kısa süre içerisinde otomatik sistemlerimiz kartınıza 300 TL değerindeki Algida puanını tanımlayacaktır.`);conversationState='idle'}

        } else { // conversationState === 'idle'
            if (messageText.startsWith('/')) {
                // Komut işleme (Değişiklik yok)
                const command = messageText.substring(1).toLowerCase().trim();
                switch (command) {
                    case 'help': addBotMessage("Kullanılabilir Komutlar:\n/help - Bu yardım mesajı.\n/bilgilerim - Kayıtlı bilgileri gösterir.\n/reset - Tüm kayıtlı bilgileri siler.\n/sponsor-kayit - Sponsor kayıt komutlarını listeler.\n/rewards - Aktif ödül fırsatlarını gösterir."); break;
                    case 'sponsor-kayit': addBotMessage("Sponsor Kayıt Komutları:\n/turkishairlines - M&S No\n/mavi - Mavi GSM\n/carrefoursa - C.SA Kart/GSM\n/swissair - Swiss Air No\n/carrefour - C. EU Kart\n/tiktak - TikTak GSM\n/trendyol - Trendyol E-posta"); break;
                    case 'rewards': let rewardsText = "Aktif Ödül Fırsatı:\n"; rewardsText += "- CarrefourSA & Algida: 300TL Değerinde Puan Fırsatı! (Detay ve katılım için: /carrefoursaxalgida)"; addBotMessage(rewardsText); break;
                    case 'bilgilerim':
                        currentUserName = loadData(USER_NAME_KEY); currentSocialMedia = loadData(SOCIAL_MEDIA_KEY); currentSocialUser = loadData(SOCIAL_USER_KEY);
                        currentTkMiles = loadData(TK_MILES_KEY); currentMaviGsm = loadData(MAVI_GSM_KEY); currentCarrefoursaInfo = loadData(CARREFOURSA_INFO_KEY);
                        currentSwissairNo = loadData(SWISSAIR_NO_KEY); currentCarrefourEu = loadData(CARREFOUR_EU_KEY); currentTiktakGsm = loadData(TIKTAK_GSM_KEY);
                        currentTrendyolEmail = loadData(TRENDYOL_EMAIL_KEY);
                        let info = "--- Temel Bilgilerin ---\n";
                        info += `İsim: ${currentUserName || '-'}\n`; info += `Platform: ${currentSocialMedia || '-'}\n`; info += `K.Adı: ${currentSocialUser || '-'}\n`;
                        info += "--- Sponsor Kayıtların ---\n";
                        info += `THY (M&S): ${currentTkMiles || '-'}\n`; info += `Mavi (GSM): ${currentMaviGsm || '-'}\n`; info += `C.SA (Kart/GSM): ${currentCarrefoursaInfo || '-'}\n`;
                        info += `Swiss Air (No): ${currentSwissairNo || '-'}\n`; info += `C. EU (Kart): ${currentCarrefourEu || '-'}\n`; info += `TikTak (GSM): ${currentTiktakGsm || '-'}\n`;
                        info += `Trendyol (Mail): ${currentTrendyolEmail || '-'}`;
                        addBotMessage(info);
                        break;
                    case 'reset': addBotMessage("Emin misin? Kayıtlı tüm bilgilerin (tanışma ve sponsor) silinecek. Onaylamak için 'Evet' yaz."); conversationState = 'awaiting_reset_confirmation'; break;
                    case 'turkishairlines': addBotMessage("Lütfen Miles&Smiles üyelik numaranızı (TK ile başlayan) girin:"); conversationState = 'awaiting_tk_no'; break;
                    case 'mavi': addBotMessage("Lütfen Mavi Kartuş Kart'a kayıtlı GSM numaranızı girin:"); conversationState = 'awaiting_mavi_gsm'; break;
                    case 'carrefoursa': addBotMessage("Lütfen CarrefourSA kart numaranızı veya kayıtlı GSM numaranızı girin:"); conversationState = 'awaiting_carrefoursa_info'; break;
                    case 'swissair': addBotMessage("Lütfen Swiss Air özel yolcu programı numaranızı girin:"); conversationState = 'awaiting_swissair_no'; break;
                    case 'carrefour': addBotMessage("Lütfen Carrefour Card (Avrupa) numaranızı girin:"); conversationState = 'awaiting_carrefour_eu'; break;
                    case 'tiktak': addBotMessage("Lütfen TikTak'a kayıtlı GSM numaranızı girin:"); conversationState = 'awaiting_tiktak_gsm'; break;
                    case 'trendyol': addBotMessage("Lütfen Trendyol'a kayıtlı e-posta adresinizi girin:"); conversationState = 'awaiting_trendyol_email'; break;
                    case 'carrefoursaxalgida': addBotMessage("Lütfen CarrefourSA Kart'a kayıtlı GSM numaranızı veya Kart numaranızı girin (Algida Kampanyası):"); conversationState = 'awaiting_carrefour_no'; break;
                    default: addBotMessage(`Bilinmeyen komut: "${command}". Yardım için /help veya /sponsor-kayit yazabilirsin.`);
                }
            }
            else { // Komut değilse normal sohbet
                const lowerCaseInput = messageText.toLowerCase();
                if (lowerCaseInput === 'merhaba' || lowerCaseInput === 'selam') { addBotMessage(`Merhaba ${currentUserName || ''}!`); }
                else if (lowerCaseInput === 'naber' || lowerCaseInput === 'nasılsın') { addBotMessage("İyiyim, sorduğun için teşekkürler! Sen nasılsın?"); }
                else {
                    // === API ÇAĞRISI HF İÇİN GÜNCELLENDİ ===
                    if (typeof HF_TOKEN !== 'undefined' && HF_TOKEN && HF_TOKEN !== 'SENIN_HF_TOKENIN_BURAYA') {
                         getHuggingFaceResponse(messageText); // Gemini yerine bunu çağırıyoruz
                    } else {
                         // Token yoksa veya placeholder ise standart cevap ver
                         addBotMessage("Üzgünüm, genel sohbet için API Token ayarlanmamış görünüyor. Komutları deneyebilirsin: /help, /sponsor-kayit, /rewards");
                    }
                    // ====================================
                }
            }
        }
    }
}


// Gönder butonuna ve Enter tuşuna olay dinleyicileri
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') { sendMessage(); } });

// Sayfa yüklendiğinde konuşmayı başlat
startConversation();
