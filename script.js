// === DOMContentLoaded Olay Dinleyicisi Başlangıcı ===
document.addEventListener('DOMContentLoaded', () => {
    console.log(">>> Kyrosil Bot v158 (Cmd Return Fix) çalıştı! <<<");

    // Gerekli HTML elementlerini seçiyoruz
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    if (!chatBox || !userInput || !sendButton) { console.error("Hata: Gerekli HTML elementleri bulunamadı!"); return; }
    else { console.log("HTML elementleri başarıyla bulundu."); }

    // localStorage için anahtar (key) tanımları
    const USER_NAME_KEY = 'kyrosil_userName'; const SOCIAL_MEDIA_KEY = 'kyrosil_socialMedia'; const SOCIAL_USER_KEY = 'kyrosil_socialUser'; const LANG_KEY = 'kyrosil_userLang'; const TK_MILES_KEY = 'kyrosil_tkMiles'; const MAVI_GSM_KEY = 'kyrosil_maviGsm'; const CARREFOURSA_INFO_KEY = 'kyrosil_carrefoursaInfo'; const SWISSAIR_NO_KEY = 'kyrosil_swissairNo'; const CARREFOUR_EU_KEY = 'kyrosil_carrefourEu'; const TIKTAK_GSM_KEY = 'kyrosil_tiktakGsm'; const TRENDYOL_EMAIL_KEY = 'kyrosil_trendyolEmail';

    // Google Gemini API Ayarları
    const GEMINI_API_KEY = 'AIzaSyDiMIy8gM65-DWVlneXq4oKW4lCqwK0nK4'; // !!! KENDİ ANAHTARINI BURAYA YAPIŞTIR !!!
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

    // Dil Ayarları ve Metinler
    let currentLang = loadData(LANG_KEY) || 'tr';
    const translations = {
        tr: { /* ... Türkçe metinler (öncekiyle aynı) ... */ welcome_new:"Avrupa'nın sponsor markalarla ilk ve tek tam entegre yapay zeka botu KyrosilRewards'a hoş geldin! ✨ Seninle tanışmak istiyorum, adın nedir?",ask_social:(name)=>`Tekrar merhaba ${name}! Bizi hangi sosyal medya platformundan takip ediyorsun? (Instagram, EU Portal, X, Tiktok)`,ask_username:(social)=>`Harika, ${social} üzerinden takip etmene sevindim! Oradaki kullanıcı adın nedir?`,onboarding_complete:(name)=>`Teşekkürler ${name}! Tüm bilgilerin kaydedildi.`,welcome_back:(name)=>`Tekrar hoş geldin, ${name}! Mevcut ödül fırsatları için /rewards, sponsor kayıtları için /sponsor-kayit yazabilirsin. Diğer komutlar için /help her zaman yanında. Dil değiştirmek için /lang [en/tr]. Ya da sadece sohbet edelim!`,prompt_social:"Lütfen listedeki platformlardan birini yazar mısın? (Instagram, EU Portal, X, Tiktok)",reset_confirm:"Emin misin? Kayıtlı tüm bilgilerin (tanışma ve sponsor) silinecek. Onaylamak için 'Evet' yaz.",reset_done:"Tüm kayıtlı bilgilerin (tanışma ve sponsor) silindi.",reset_cancel:"İşlem iptal edildi.",prompt_tk:"Lütfen Miles&Smiles üyelik numaranızı (TK ile başlayan) girin:",confirm_tk:(tkNo)=>`Miles&Smiles (${tkNo}) kaydınız alındı. Özel teklifler için takipte kalın!`,prompt_mavi:"Lütfen Mavi Kartuş Kart'a kayıtlı GSM numaranızı girin:",confirm_mavi:(gsm)=>`Mavi Kartuş (${gsm}) GSM kaydınız alındı. Kampanyalardan haberdar edileceksiniz!`,prompt_carrefoursa:"Lütfen CarrefourSA kart numaranızı veya kayıtlı GSM numaranızı girin:",confirm_carrefoursa:(info)=>`CarrefourSA (${info}) bilginiz kaydedildi. İlgili kampanyalar hakkında bilgi verilecek!`,prompt_swissair:"Lütfen Swiss Air özel yolcu programı numaranızı girin:",confirm_swissair:(no)=>`Swiss Air (${no}) yolcu programı kaydınız alındı. Uçuşlarınızda başarılar!`,prompt_carrefour_eu:"Lütfen Carrefour Card (Avrupa) numaranızı girin:",confirm_carrefour_eu:(no)=>`Carrefour Avrupa (${no}) kart bilginiz kaydedildi. Bölgesel kampanyalar için takipte kalın!`,prompt_tiktak:"Lütfen TikTak'a kayıtlı GSM numaranızı girin:",confirm_tiktak:(gsm)=>`TikTak (${gsm}) GSM kaydınız alındı. Kullanımlarınızda bol şans!`,prompt_trendyol:"Lütfen Trendyol'a kayıtlı e-posta adresinizi girin:",confirm_trendyol:(mail)=>`Trendyol (${mail}) e-posta adresiniz kaydedildi. Özel indirimler için hesabınızı kontrol edin!`,prompt_csa_algida:"Lütfen CarrefourSA Kart'a kayıtlı GSM numaranızı veya Kart numaranızı girin (Algida Kampanyası):",confirm_csa_algida:(num)=>`Katılımınız alındı! Girdiğiniz numara (${num}) için kısa süre içerisinde otomatik sistemlerimiz kartınıza 300 TL değerindeki Algida puanını tanımlayacaktır.`,help_text:"Kullanılabilir Komutlar:\n/help - Yardım.\n/bilgilerim - Bilgilerini gösterir.\n/reset - Bilgilerini siler.\n/sponsor-kayit - Sponsor komutları.\n/rewards - Ödül fırsatları.\n/lang [en/tr] - Dil değiştirir.",sponsor_list_text:"Sponsor Kayıtları:\n/turkishairlines - M&S No\n/mavi - Mavi GSM\n/carrefoursa - C.SA Kart/GSM\n/swissair - Swiss Air No\n/carrefour - C. EU Kart\n/tiktak - TikTak GSM\n/trendyol - Trendyol E-posta",rewards_text:"Aktif Ödül Fırsatı:\n- CarrefourSA & Algida: 300TL Değerinde Puan Fırsatı! (/carrefoursaxalgida)",my_info_title_basic:"--- Temel Bilgilerin ---",my_info_name:"İsim:",my_info_platform:"Platform:",my_info_username:"K.Adı:",my_info_title_sponsor:"--- Sponsor Kayıtların ---",my_info_sponsor_tk:"THY (M&S):",my_info_sponsor_mavi:"Mavi (GSM):",my_info_sponsor_csa:"C.SA (Kart/GSM):",my_info_sponsor_swiss:"Swiss Air (No):",my_info_sponsor_ceu:"C. EU (Kart):",my_info_sponsor_tiktak:"TikTak (GSM):",my_info_sponsor_trendyol:"Trendyol (Mail):",not_registered:"Kaydedilmemiş",not_registered_short:"-",unknown_command:(cmd)=>`Bilinmeyen komut: "${cmd}". Yardım için /help yazabilirsin.`,greeting_hello:(name)=>`Merhaba ${name||''}!`,greeting_how_are_you:"İyiyim, sorduğun için teşekkürler! Sen nasılsın?",generic_reply_api_off:"Şu an sadece belirli komutlara ve selamlaşmalara cevap verebiliyorum ama komutları kullanabilirsin: /help, /sponsor-kayit, /rewards",api_fail_generic:"Üzgünüm, bir cevap alamadım.",api_fail_error:(err)=>`Üzgünüm, şu an sana cevap veremiyorum. Hata: ${err}`,content_blocked:(reason)=>`İçerik güvenlik nedeniyle engellendi: ${reason}`,model_loading:"Model şu an yükleniyor, lütfen birkaç saniye sonra tekrar deneyin...",lang_set_tr:"Dil Türkçe olarak ayarlandı.",lang_set_en:"Language set to English.",lang_fail:"Desteklenmeyen dil kodu. Lütfen 'en' veya 'tr' kullanın.",generic_replies:["Anladım.","Hmm, peki.","İlginç.","Tamamdır.","Devam et...","Peki."]},
        en: { /* ... İngilizce metinler (öncekiyle aynı) ... */ welcome_new:"Welcome to KyrosilRewards, Europe's first and only fully integrated AI bot with sponsor brands! ✨ I'd like to get to know you, what is your name?",ask_social:(name)=>`Welcome back ${name}! Which social media platform do you follow us from? (Instagram, EU Portal, X, Tiktok)`,ask_username:(social)=>`Great, glad you follow us via ${social}! What is your username there?`,onboarding_complete:(name)=>`Thanks ${name}! All your information has been saved.`,welcome_back:(name)=>`Welcome back, ${name}! If you're ready for great collaborations and rewards, you can type /sponsor-kayit to see sponsor registration commands or /rewards for current opportunities. /help is always there for other commands. To change language, type /lang [en/tr]. Or let's just chat!`,prompt_social:"Please type one of the platforms from the list (Instagram, EU Portal, X, Tiktok)",reset_confirm:"Are you sure? All your registered information (onboarding and sponsor) will be deleted. Type 'Yes' to confirm.",reset_done:"All your registered information (onboarding and sponsor) has been deleted.",reset_cancel:"Operation cancelled.",prompt_tk:"Please enter your Miles&Smiles membership number (starting with TK):",confirm_tk:(tkNo)=>`Your Miles&Smiles (${tkNo}) registration has been received. Stay tuned for special offers!`,prompt_mavi:"Please enter your GSM number registered to Mavi Kartuş Kart:",confirm_mavi:(gsm)=>`Your Mavi Kartuş (${gsm}) GSM registration has been received. You will be informed about campaigns!`,prompt_carrefoursa:"Please enter your CarrefourSA card number or registered GSM number:",confirm_carrefoursa:(info)=>`Your CarrefourSA (${info}) information has been saved. You will be informed about relevant campaigns!`,prompt_swissair:"Please enter your Swiss Air special passenger program number:",confirm_swissair:(no)=>`Your Swiss Air (${no}) passenger program registration has been received. Have a good flight!`,prompt_carrefour_eu:"Please enter your Carrefour Card (Europe) number:",confirm_carrefour_eu:(no)=>`Your Carrefour Europe (${no}) card information has been saved. Stay tuned for regional campaigns!`,prompt_tiktak:"Please enter your GSM number registered to TikTak:",confirm_tiktak:(gsm)=>`Your TikTak (${gsm}) registration has been received. Good luck with your usage!`,prompt_trendyol:"Please enter your e-mail address registered to Trendyol:",confirm_trendyol:(mail)=>`Your Trendyol (${mail}) e-mail address has been saved. Check your account for special discounts!`,prompt_csa_algida:"Please enter your CarrefourSA Card registered GSM number or Card number (Algida Campaign):",confirm_csa_algida:(num)=>`Your participation is received! Our automated systems will credit the 300 TL worth of Algida points to your card for the number (${num}) shortly.`,help_text:"Available Commands:\n/help - Show this help message.\n/bilgilerim - Show your registered info.\n/reset - Delete all your registered info.\n/sponsor-kayit - List sponsor registration commands.\n/rewards - Show active reward opportunities.\n/lang [en/tr] - Change language.",sponsor_list_text:"Sponsor Registrations:\n/turkishairlines - M&S No\n/mavi - Mavi GSM\n/carrefoursa - C.SA Card/GSM\n/swissair - Swiss Air No\n/carrefour - C. EU Card\n/tiktak - TikTak GSM\n/trendyol - Trendyol E-mail",rewards_text:"Active Reward Opportunity:\n- CarrefourSA & Algida: 300TL Point Opportunity! (/carrefoursaxalgida)",my_info_title_basic:"--- Your Basic Info ---",my_info_name:"Name:",my_info_platform:"Platform:",my_info_username:"Username:",my_info_title_sponsor:"--- Your Sponsor Registrations ---",my_info_sponsor_tk:"THY (M&S):",my_info_sponsor_mavi:"Mavi (GSM):",my_info_sponsor_csa:"C.SA (Card/GSM):",my_info_sponsor_swiss:"Swiss Air (No):",my_info_sponsor_ceu:"C. EU (Card):",my_info_sponsor_tiktak:"TikTak (GSM):",my_info_sponsor_trendyol:"Trendyol (Mail):",not_registered:"Not Registered",not_registered_short:"-",unknown_command:(cmd)=>`Unknown command: "${cmd}". Type /help for assistance.`,greeting_hello:(name)=>`Hello ${name||''}!`,greeting_how_are_you:"I'm doing well, thanks for asking! How are you?",generic_reply_api_off:"Currently, I can only respond to specific commands and greetings, but you can use commands: /help, /sponsor-kayit, /rewards",api_fail_generic:"Sorry, I couldn't get a response.",api_fail_error:(err)=>`Sorry, I can't answer you right now. Error: ${err}`,content_blocked:(reason)=>`Content blocked due to safety reasons: ${reason}`,model_loading:"The model is currently loading, please try again in a few seconds...",lang_set_tr:"Dil Türkçe olarak ayarlandı.",lang_set_en:"Language set to English.",lang_fail:"Unsupported language code. Please use 'en' or 'tr'.",generic_replies:["I see.","Hmm, okay.","Interesting point.","Noted.","Alright.","You can continue...","Okay, any other topic?"]}
    };
    // =============================

    // --- Değişkenler ---
    let chatHistory = [];
    const MAX_HISTORY_LENGTH = 6;
    let currentUserName, currentSocialMedia, currentSocialUser;

    // --- Temel Fonksiyonlar ---
    // ... (localStorage, Mesaj Ekleme, Kaydırma, Rastgele Cevap fonksiyonları burada) ...
     function saveData(key, value){try{localStorage.setItem(key, value);console.log(`kaydedildi: ${key}=${value}`)}catch(e){console.error("kayıt hatası:",e)}};function loadData(key){try{const data=localStorage.getItem(key);return data}catch(e){console.error("okuma hatası:",e);return null}};function removeData(key){try{localStorage.removeItem(key);console.log(`silindi: ${key}`)}catch(e){console.error("silme hatası:",e)}};function removeAllSponsorData(){removeData(TK_MILES_KEY);removeData(MAVI_GSM_KEY);removeData(CARREFOURSA_INFO_KEY);removeData(SWISSAIR_NO_KEY);removeData(CARREFOUR_EU_KEY);removeData(TIKTAK_GSM_KEY);removeData(TRENDYOL_EMAIL_KEY);};function addMessage(text, role) {const messageClass = role === 'user' ? 'user-message' : 'bot-message'; const messageElement = document.createElement('div'); messageElement.classList.add('message', messageClass); const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); const timestampSpan = document.createElement('span'); timestampSpan.classList.add('timestamp'); timestampSpan.textContent = timestamp; const paragraph = document.createElement('p'); paragraph.textContent = text; const contentWrapper = document.createElement('div'); contentWrapper.appendChild(paragraph); contentWrapper.appendChild(timestampSpan); messageElement.appendChild(contentWrapper); if (chatBox) { chatBox.appendChild(messageElement); } else { console.error("addMessage içinde chatBox elementi bulunamadı!"); return; } if(role === 'user' || role === 'model') { chatHistory.push({ role: role, parts: [{ text: text }] }); if (chatHistory.length > MAX_HISTORY_LENGTH) { chatHistory = chatHistory.slice(chatHistory.length - MAX_HISTORY_LENGTH); } } scrollToBottom(); }; function addMessageToChatBoxOnly(text, messageClass) { const messageElement = document.createElement('div'); messageElement.classList.add('message', messageClass); const paragraph = document.createElement('p'); paragraph.textContent = text; const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); const timestampSpan = document.createElement('span'); timestampSpan.classList.add('timestamp'); timestampSpan.textContent = timestamp; paragraph.appendChild(timestampSpan); messageElement.appendChild(paragraph); if (chatBox) { chatBox.appendChild(messageElement); } else { console.error("addMessageToChatBoxOnly içinde chatBox elementi bulunamadı!"); return; } scrollToBottom(); }; function addBotMessage(text, delay = 600) { setTimeout(() => { addMessage(text, 'model'); }, delay); }; function scrollToBottom() { if (chatBox) { chatBox.scrollTop = chatBox.scrollHeight; } }; function getRandomGenericReply() { const randomIndex = Math.floor(Math.random() * translations[currentLang].generic_replies.length); return translations[currentLang].generic_replies[randomIndex]; };


    // --- Gemini API Fonksiyonu ---
    async function getGeminiResponse() { /* ... önceki kod ... */ }
    async function getGeminiResponse(){if(chatHistory.length===0||chatHistory[chatHistory.length-1].role!=='user'){return}addMessageToChatBoxOnly("...",'bot-message');const thinkingMessageElement=chatBox.lastElementChild;const payload={contents:chatHistory};try{if(!GEMINI_API_KEY||GEMINI_API_KEY==='SENIN_API_ANAHTARIN_BURAYA'){throw new Error(translations[currentLang].api_fail_error("API Anahtarı ayarlanmamış veya geçersiz."))}const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!response.ok){const errorData=await response.json();throw new Error(`API Hatası: ${response.status} - ${errorData?.error?.message||response.statusText}`)}const data=await response.json();let botReply=translations[currentLang].api_fail_generic;if(data.candidates&&data.candidates.length>0&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts.length>0){botReply=data.candidates[0].content.parts[0].text}else if(data.promptFeedback&&data.promptFeedback.blockReason){botReply=translations[currentLang].content_blocked(data.promptFeedback.blockReason);console.error("API İçerik Engeli:",data.promptFeedback)}else{console.error("Beklenmeyen API cevap formatı:",data)}if(thinkingMessageElement&&thinkingMessageElement.classList.contains('bot-message')&&thinkingMessageElement.textContent.startsWith("...")) {thinkingMessageElement.remove()}addMessage(botReply,'model')}catch(error){console.error("Gemini API isteği başarısız:",error);if(thinkingMessageElement&&thinkingMessageElement.classList.contains('bot-message')&&thinkingMessageElement.textContent.startsWith("...")) {thinkingMessageElement.remove()}addMessage(translations[currentLang].api_fail_error(error.message),'model')}} // Hata mesajını geçmişe ekle


    // --- Konuşmayı Başlatma Fonksiyonu ---
    function startConversation() {
        console.log("--- startConversation FONKSIYONU ÇALIŞTI! ---");
        chatHistory = [];
        // Ekrana ilk mesajı ekle (geçmişe değil)
        addMessageToChatBoxOnly(translations[currentLang].welcome_new.split("✨")[0] + "✨", 'bot-message');

        // Sonraki adımı belirle (geçmişe ekleyerek)
        if (!currentUserName) { addBotMessage(translations[currentLang].ask_name, 100); conversationState = 'awaiting_name'; }
        else if (!currentSocialMedia) { addBotMessage(translations[currentLang].ask_social(currentUserName), 100); conversationState = 'awaiting_social'; }
        else if (!currentSocialUser) { addBotMessage(translations[currentLang].ask_username(currentSocialMedia), 100); conversationState = 'awaiting_username'; }
        else { addBotMessage(translations[currentLang].welcome_back(currentUserName), 100); conversationState = 'idle'; }
        setTimeout(scrollToBottom, 150);
    }


    // --- Mesaj Gönderme Ana Mantığı ---
    function sendMessage() {
        if (!userInput) { return; }
        const messageText = userInput.value.trim();
        if (messageText !== "") {
            addMessage(messageText, 'user'); // Kullanıcı mesajını ekle (geçmişe de)
            userInput.value = '';

            // --- State Handling (Onboarding, Reset, Sponsorlar) ---
            if (conversationState === 'awaiting_name') { currentUserName = messageText; saveData(USER_NAME_KEY, currentUserName); addBotMessage(translations[currentLang].ask_social(currentUserName), 100); conversationState = 'awaiting_social'; }
            else if (conversationState === 'awaiting_social') { const lci = messageText.toLowerCase(); if (allowedSocialMedia.includes(lci)) { currentSocialMedia = lci; saveData(SOCIAL_MEDIA_KEY, currentSocialMedia); addBotMessage(translations[currentLang].ask_username(currentSocialMedia), 100); conversationState = 'awaiting_username'; } else { addBotMessage(translations[currentLang].prompt_social); } }
            else if (conversationState === 'awaiting_username') { currentSocialUser = messageText; saveData(SOCIAL_USER_KEY, currentSocialUser); addBotMessage(translations[currentLang].onboarding_complete(currentUserName)); addBotMessage(translations[currentLang].welcome_back(currentUserName), 100); conversationState = 'idle'; }
            else if (conversationState === 'awaiting_reset_confirmation') { const lci = messageText.toLowerCase(); if (lci === 'evet' || lci === 'yes') { removeData(USER_NAME_KEY); removeData(SOCIAL_MEDIA_KEY); removeData(SOCIAL_USER_KEY); removeAllSponsorData(); currentUserName = null; currentSocialMedia = null; currentSocialUser = null; addBotMessage(translations[currentLang].reset_done); conversationState = 'idle'; setTimeout(startConversation, 800); } else { addBotMessage(translations[currentLang].reset_cancel); conversationState = 'idle'; } }
            else if (conversationState === 'awaiting_tk_no') { const tkNo=messageText;saveData(TK_MILES_KEY,tkNo);addBotMessage(translations[currentLang].confirm_tk(tkNo));conversationState='idle'; }
            else if (conversationState === 'awaiting_mavi_gsm') { const maviGsm=messageText;saveData(MAVI_GSM_KEY,maviGsm);addBotMessage(translations[currentLang].confirm_mavi(maviGsm));conversationState='idle'; }
            else if (conversationState === 'awaiting_carrefoursa_info') { const csInfo=messageText;saveData(CARREFOURSA_INFO_KEY,csInfo);addBotMessage(translations[currentLang].confirm_carrefoursa(csInfo));conversationState='idle'; }
            else if (conversationState === 'awaiting_swissair_no') { const swissNo=messageText;saveData(SWISSAIR_NO_KEY,swissNo);addBotMessage(translations[currentLang].confirm_swissair(swissNo));conversationState='idle'; } // Dikkat: swissNo kullanıldı
            else if (conversationState === 'awaiting_carrefour_eu') { const cEuNo=messageText;saveData(CARREFOUR_EU_KEY,cEuNo);addBotMessage(translations[currentLang].confirm_carrefour_eu(cEuNo));conversationState='idle'; }
            else if (conversationState === 'awaiting_tiktak_gsm') { const tiktakGsm=messageText;saveData(TIKTAK_GSM_KEY,tiktakGsm);addBotMessage(translations[currentLang].confirm_tiktak(tiktakGsm));conversationState='idle'; } // Dikkat: gsm kullanıldı
            else if (conversationState === 'awaiting_trendyol_email') { const trendyolMail=messageText;saveData(TRENDYOL_EMAIL_KEY,trendyolMail);addBotMessage(translations[currentLang].confirm_trendyol(trendyolMail));conversationState='idle'; } // Dikkat: mail kullanıldı
            else if (conversationState === 'awaiting_carrefour_no') { const enteredNumber=messageText;addBotMessage(translations[currentLang].confirm_csa_algida(enteredNumber));conversationState='idle'; }
             // --- State Handling Bitti ---

            else { // conversationState === 'idle'
                if (messageText.startsWith('/')) {
                    // === Komut İşleme (Dil Desteği Eklendi) ===
                    const parts = messageText.substring(1).toLowerCase().trim().split(' ');
                    const command = parts[0];
                    const args = parts.slice(1);
                    let commandHandled = true;

                    switch (command) {
                        case 'help': addBotMessage(translations[currentLang].help_text); break;
                        case 'sponsor-kayit': addBotMessage(translations[currentLang].sponsor_list_text); break;
                        case 'rewards': addBotMessage(translations[currentLang].rewards_text); break;
                        case 'bilgilerim':
                            let currentTkMiles,currentMaviGsm,currentCarrefoursaInfo,currentSwissairNo,currentCarrefourEu,currentTiktakGsm,currentTrendyolEmail; // Tanımlamaları buraya alalım
                            currentUserName=loadData(USER_NAME_KEY);currentSocialMedia=loadData(SOCIAL_MEDIA_KEY);currentSocialUser=loadData(SOCIAL_USER_KEY);currentTkMiles=loadData(TK_MILES_KEY);currentMaviGsm=loadData(MAVI_GSM_KEY);currentCarrefoursaInfo=loadData(CARREFOURSA_INFO_KEY);currentSwissairNo=loadData(SWISSAIR_NO_KEY);currentCarrefourEu=loadData(CARREFOUR_EU_KEY);currentTiktakGsm=loadData(TIKTAK_GSM_KEY);currentTrendyolEmail=loadData(TRENDYOL_EMAIL_KEY);
                            let info = translations[currentLang].my_info_title_basic + "\n";
                            info += `${translations[currentLang].my_info_name} ${currentUserName || translations[currentLang].not_registered_short}\n`;
                            info += `${translations[currentLang].my_info_platform} ${currentSocialMedia || translations[currentLang].not_registered_short}\n`;
                            info += `${translations[currentLang].my_info_username} ${currentSocialUser || translations[currentLang].not_registered_short}\n`;
                            info += translations[currentLang].my_info_title_sponsor + "\n";
                            info += `${translations[currentLang].my_info_sponsor_tk} ${currentTkMiles || translations[currentLang].not_registered_short}\n`;
                            info += `${translations[currentLang].my_info_sponsor_mavi} ${currentMaviGsm || translations[currentLang].not_registered_short}\n`;
                            info += `${translations[currentLang].my_info_sponsor_csa} ${currentCarrefoursaInfo || translations[currentLang].not_registered_short}\n`;
                            info += `${translations[currentLang].my_info_sponsor_swiss} ${currentSwissairNo || translations[currentLang].not_registered_short}\n`;
                            info += `${translations[currentLang].my_info_sponsor_ceu} ${currentCarrefourEu || translations[currentLang].not_registered_short}\n`;
                            info += `${translations[currentLang].my_info_sponsor_tiktak} ${currentTiktakGsm || translations[currentLang].not_registered_short}\n`;
                            info += `${translations[currentLang].my_info_sponsor_trendyol} ${currentTrendyolEmail || translations[currentLang].not_registered_short}`;
                            addBotMessage(info);
                            break;
                        case 'reset': addBotMessage(translations[currentLang].reset_confirm); conversationState = 'awaiting_reset_confirmation'; break;
                        case 'turkishairlines': addBotMessage(translations[currentLang].prompt_tk); conversationState = 'awaiting_tk_no'; break;
                        case 'mavi': addBotMessage(translations[currentLang].prompt_mavi); conversationState = 'awaiting_mavi_gsm'; break;
                        case 'carrefoursa': addBotMessage(translations[currentLang].prompt_carrefoursa); conversationState = 'awaiting_carrefoursa_info'; break;
                        case 'swissair': addBotMessage(translations[currentLang].prompt_swissair); conversationState = 'awaiting_swissair_no'; break;
                        case 'carrefour': addBotMessage(translations[currentLang].prompt_carrefour_eu); conversationState = 'awaiting_carrefour_eu'; break;
                        case 'tiktak': addBotMessage(translations[currentLang].prompt_tiktak); conversationState = 'awaiting_tiktak_gsm'; break;
                        case 'trendyol': addBotMessage(translations[currentLang].prompt_trendyol); conversationState = 'awaiting_trendyol_email'; break;
                        case 'carrefoursaxalgida': addBotMessage(translations[currentLang].prompt_csa_algida); conversationState = 'awaiting_carrefour_no'; break;
                        case 'lang':
                            if (args.length > 0 && (args[0] === 'en' || args[0] === 'tr')) {
                                currentLang = args[0];
                                saveData(LANG_KEY, currentLang);
                                // Onay mesajını doğru dilde verelim
                                addBotMessage(currentLang === 'en' ? translations.en.lang_set_en : translations.tr.lang_set_tr);
                                // İsteğe bağlı: Dil değişince karşılama mesajını tekrar gösterebiliriz
                                // setTimeout(startConversation, 100);
                            } else {
                                addBotMessage(translations[currentLang].lang_fail);
                            }
                            break;
                        default: addBotMessage(translations[currentLang].unknown_command(command)); commandHandled = false;
                    }
                    // Bilinen bir komut işlendiyse, daha fazla işlem yapma (API'ye gitme)
                    if (commandHandled) { 
                         console.log("Komut işlendi, API çağrısı atlanıyor.");
                         return; 
                    }
                    // ==============================
                }
                else { // Komut değilse normal sohbet
                    const lowerCaseInput = messageText.toLowerCase();
                    let greetingHandled = true;
                     if (lowerCaseInput === 'merhaba' || lowerCaseInput === 'selam' || lowerCaseInput === 'hello' || lowerCaseInput === 'hi') { addBotMessage(translations[currentLang].greeting_hello(currentUserName)); }
                     else if (lowerCaseInput === 'naber' || lowerCaseInput === 'nasılsın' || lowerCaseInput.includes('how are you')) { addBotMessage(translations[currentLang].greeting_how_are_you); }
                     else { greetingHandled = false; }

                    if (!greetingHandled) {
                        if (typeof GEMINI_API_KEY !== 'undefined' && GEMINI_API_KEY && GEMINI_API_KEY !== 'SENIN_API_ANAHTARIN_BURAYA') {
                             console.log("API çağrılıyor..."); // Konsola log ekle
                             getGeminiResponse();
                        } else {
                            console.log("API anahtarı yok/geçersiz, rastgele cevap veriliyor."); // Konsola log ekle
                            addBotMessage(getRandomGenericReply());
                        }
                    } else {
                         console.log("Selamlaşma işlendi, API çağrısı atlanıyor.");
                    }
                }
            }
        }
    }

    // === Olay Dinleyicileri ===
    if (sendButton) { sendButton.addEventListener('click', sendMessage); }
    if (userInput) { userInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') { sendMessage(); } }); }

    // === Başlangıç ===
    currentUserName = loadData(USER_NAME_KEY);
    currentSocialMedia = loadData(SOCIAL_MEDIA_KEY);
    currentSocialUser = loadData(SOCIAL_USER_KEY);
    currentLang = loadData(LANG_KEY) || 'tr'; // Dili yükle
    startConversation(); // Konuşmayı başlat

}); // === DOMContentLoaded Olay Dinleyicisi Sonu ===
