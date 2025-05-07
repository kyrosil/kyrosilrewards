// === DOMContentLoaded Olay Dinleyicisi Başlangıcı ===
document.addEventListener('DOMContentLoaded', () => {
    console.log(">>> Kyrosil Bot FINAL (v168) çalıştı! <<<");

    // Gerekli HTML elementlerini seçiyoruz
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const uploadButton = document.getElementById('upload-button');
    const imageUpload = document.getElementById('image-upload');
    const filterButton = document.getElementById('filter-button');
    const previewImg = document.getElementById('preview-img');
    const imagePreview = document.getElementById('image-preview');
    const sendPhotoButton = document.getElementById('send-photo-button');
    const deepsearchButton = document.getElementById('deepsearch-button');
    const thinkButton = document.getElementById('think-button');
    const toggleTheme = document.getElementById('toggle-theme');

    if (!chatBox || !userInput || !sendButton || !uploadButton || !imageUpload || !filterButton || !previewImg || !imagePreview || !sendPhotoButton || !deepsearchButton || !thinkButton || !toggleTheme) {
        console.error("Hata: Gerekli HTML elementleri bulunamadı!");
        return;
    } else {
        console.log("HTML elementleri başarıyla bulundu.");
    }

    // API Anahtarları (Kendi anahtarını ekle!)
    const GEMINI_API_KEY = 'AIzaSyDiMIy8gM65-DWVlneXq4oKW4lCqwK0nK4'; // Gemini için
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;

    // localStorage için anahtar (key) tanımları
    const USER_NAME_KEY = 'kyrosil_userName'; 
    const SOCIAL_MEDIA_KEY = 'kyrosil_socialMedia'; 
    const SOCIAL_USER_KEY = 'kyrosil_socialUser'; 
    const LANG_KEY = 'kyrosil_userLang'; 
    const TK_MILES_KEY = 'kyrosil_tkMiles'; 
    const MAVI_GSM_KEY = 'kyrosil_maviGsm'; 
    const CARREFOURSA_INFO_KEY = 'kyrosil_carrefoursaInfo'; 
    const SWISSAIR_NO_KEY = 'kyrosil_swissairNo'; 
    const CARREFOUR_EU_KEY = 'kyrosil_carrefourEu'; 
    const TIKTAK_GSM_KEY = 'kyrosil_tiktakGsm'; 
    const TRENDYOL_EMAIL_KEY = 'kyrosil_trendyolEmail'; 
    const CSA_ALGIDA_KEY = 'kyrosil_csaAlgidaInfo';

    // === Değişkenler ===
    let conversationState = 'idle';
    const allowedSocialMedia = ['instagram', 'eu portal', 'x', 'tiktok'];
    let chatHistory = [];
    const MAX_HISTORY_LENGTH = 6;
    let currentUserName, currentSocialMedia, currentSocialUser;
    let currentLang = loadData(LANG_KEY) || 'tr';
    let originalImage = null;
    let isLightMode = false;
    let pendingImage = null; // Gönderilecek fotoğrafı tutmak için

    // === Dil Metinleri ===
    const translations = {
        tr: { 
            welcome_new: "Avrupa'nın sponsor markalarla ilk ve tek tam entegre yapay zeka botu KyrosilRewards'a hoş geldin! ✨",
            ask_name: "Seninle tanışmak istiyorum, adın nedir?",
            ask_social: (name) => `Tekrar merhaba ${name}! Bizi hangi sosyal medya platformundan takip ediyorsun? (Instagram, EU Portal, X, Tiktok)`,
            ask_username: (social) => `Harika, ${social} üzerinden takip etmene sevindim! Oradaki kullanıcı adın nedir?`,
            onboarding_complete: (name) => `Teşekkürler ${name}! Tüm bilgilerin kaydedildi.`,
            welcome_back: (name) => `Tekrar hoş geldin, ${name}! Mevcut ödül fırsatları için /rewards, sponsor kayıtları için /sponsors yazabilirsin. Diğer komutlar için /help her zaman yanında. Dil değiştirmek için /lang [en/tr]. Ya da sadece sohbet edelim!`,
            prompt_social: "Lütfen listedeki platformlardan birini yazar mısın? (Instagram, EU Portal, X, Tiktok)",
            reset_confirm: "Emin misin? Kayıtlı tüm bilgilerin (tanışma ve sponsor) silinecek. Onaylamak için 'Evet' yaz.",
            reset_done: "Tüm kayıtlı bilgilerin (tanışma ve sponsor) silindi.",
            reset_cancel: "İşlem iptal edildi.",
            prompt_tk: "Lütfen Miles&Smiles üyelik numaranızı (TK ile başlayan) girin:",
            confirm_tk: (tkNo) => `Miles&Smiles (${tkNo}) kaydınız alındı. Özel teklifler için takipte kalın!`,
            prompt_mavi: "Lütfen Mavi Kartuş Kart'a kayıtlı GSM numaranızı girin:",
            confirm_mavi: (gsm) => `Mavi Kartuş (${gsm}) GSM kaydınız alındı. Kampanyalardan haberdar edileceksiniz!`,
            prompt_carrefoursa: "Lütfen CarrefourSA kart numaranızı veya kayıtlı GSM numaranızı girin:",
            confirm_carrefoursa: (info) => `CarrefourSA (${info}) bilginiz kaydedildi. İlgili kampanyalar hakkında bilgi verilecek!`,
            prompt_swissair: "Lütfen Swiss Air özel yolcu programı numaranızı girin:",
            confirm_swissair: (no) => `Swiss Air (${no}) yolcu programı kaydınız alındı. Uçuşlarınızda başarılar!`,
            prompt_carrefour_eu: "Lütfen Carrefour Card (Avrupa) numaranızı girin:",
            confirm_carrefour_eu: (no) => `Carrefour Avrupa (${no}) kart bilginiz kaydedildi. Bölgesel kampanyalar için takipte kalın!`,
            prompt_tiktak: "Lütfen TikTak'a kayıtlı GSM numaranızı girin:",
            confirm_tiktak: (gsm) => `TikTak (${gsm}) GSM kaydınız alındı. Kullanımlarınızda bol şans!`,
            prompt_trendyol: "Lütfen Trendyol'a kayıtlı e-posta adresinizi girin:",
            confirm_trendyol: (mail) => `Trendyol (${mail}) e-posta adresiniz kaydedildi. Özel indirimler için hesabınızı kontrol edin!`,
            prompt_csa_algida: "Lütfen CarrefourSA Kart'a kayıtlı GSM numaranızı veya Kart numaranızı girin (Algida Kampanyası):",
            confirm_csa_algida: (num) => `Katılımınız alındı! Girdiğiniz numara (${num}) için kısa süre içerisinde otomatik sistemlerimiz kartınıza 300 TL değerindeki Algida puanını tanımlayacaktır.`,
            help_text: "Kullanılabilir Komutlar:\n/help - Yardım.\n/myinfo - Bilgilerini gösterir.\n/reset - Bilgilerini siler.\n/sponsors - Sponsor komutları.\n/rewards - Ödül fırsatları.\n/lang [en/tr] - Dil değiştirir.\n/upload - Fotoğraf yükler.\n/filter - Kontrast ayarı yapar.",
            sponsor_list_text: "Sponsor Kayıtları:\n/turkish - Miles&Smiles No\n/mavi - Mavi GSM\n/carrefoursa - C.SA Kart/GSM\n/swiss - Swiss Air No\n/carrefour_eu - C. EU Kart\n/tiktak - TikTak GSM\n/trendyol - Trendyol E-posta",
            rewards_text: "Aktif Ödül Fırsatı:\n- CarrefourSA & Algida: 300TL Değerinde Puan Fırsatı! (/csa_algida)",
            my_info_title_basic: "--- Temel Bilgilerin ---",
            my_info_name: "İsim:",
            my_info_platform: "Platform:",
            my_info_username: "K.Adı:",
            my_info_title_sponsor: "--- Sponsor Kayıtların ---",
            my_info_sponsor_tk: "THY (M&S):",
            my_info_sponsor_mavi: "Mavi (GSM):",
            my_info_sponsor_csa: "C.SA (Kart/GSM):",
            my_info_sponsor_swiss: "Swiss Air (No):",
            my_info_sponsor_ceu: "C. EU (Kart):",
            my_info_sponsor_tiktak: "TikTak (GSM):",
            my_info_sponsor_trendyol: "Trendyol (Mail):",
            not_registered: "Kaydedilmemiş",
            not_registered_short: "-",
            unknown_command: (cmd) => `Bilinmeyen komut: "${cmd}". Yardım için /help yazabilirsin.`,
            greeting_hello: (name) => `Merhaba ${name||''}!`,
            greeting_how_are_you: "İyiyim, sorduğun için teşekkürler! Sen nasılsın?",
            generic_reply_api_off: "Şu an sadece belirli komutlara ve selamlaşmalara cevap verebiliyorum ama komutları kullanabilirsin: /help, /sponsors, /rewards",
            api_fail_generic: "Üzgünüm, bir cevap alamadım.",
            api_fail_error: (err) => `Üzgünüm, şu an sana cevap veremiyorum. Hata: ${err}`,
            content_blocked: (reason) => `İçerik güvenlik nedeniyle engellendi: ${reason}`,
            model_loading: "Model şu an yükleniyor, lütfen birkaç saniye sonra tekrar deneyin...",
            lang_set_tr: "Dil Türkçe olarak ayarlandı.",
            lang_set_en: "Language set to English.",
            lang_fail: "Desteklenmeyen dil kodu. Lütfen 'en' veya 'tr' kullanın.",
            generic_replies: ["Anladım.", "Hmm, peki.", "İlginç.", "Tamamdır.", "Devam et...", "Peki."],
            input_placeholder: "Mesajınızı yazın...",
            image_uploaded: "Fotoğraf yüklendi! Göndermek için 'Gönder' tuşuna basın.",
            filter_applied: "Kontrast ayarı uygulandı!",
            no_image: "Önce bir fotoğraf yükleyin!",
            deepsearching: "Arama yapılıyor...",
            thinking: "Düşünüyorum..."
        },
        en: { 
            welcome_new: "Welcome to KyrosilRewards, Europe's first and only fully integrated AI bot with sponsor brands! ✨",
            ask_name: "I'd like to get to know you, what is your name?",
            ask_social: (name) => `Welcome back ${name}! Which social media platform do you follow us from? (Instagram, EU Portal, X, Tiktok)`,
            ask_username: (social) => `Great, glad you follow us via ${social}! What is your username there?`,
            onboarding_complete: (name) => `Thanks ${name}! All your information has been saved.`,
            welcome_back: (name) => `Welcome back, ${name}! If you're ready for great collaborations and rewards, you can type /rewards for current opportunities or /sponsors to see sponsor registration commands. /help is always there for other commands. To change language, type /lang [en/tr]. Or let's just chat!`,
            prompt_social: "Please type one of the platforms from the list (Instagram, EU Portal, X, Tiktok)",
            reset_confirm: "Are you sure? All your registered information (onboarding and sponsor) will be deleted. Type 'Yes' to confirm.",
            reset_done: "All your registered information (onboarding and sponsor) has been deleted.",
            reset_cancel: "Operation cancelled.",
            prompt_tk: "Please enter your Miles&Smiles membership number (starting with TK):",
            confirm_tk: (tkNo) => `Your Miles&Smiles (${tkNo}) registration has been received. Stay tuned for special offers!`,
            prompt_mavi: "Please enter your GSM number registered to Mavi Kartuş Kart:",
            confirm_mavi: (gsm) => `Your Mavi Kartuş (${gsm}) GSM registration has been received. You will be informed about campaigns!`,
            prompt_carrefoursa: "Please enter your CarrefourSA card number or registered GSM number:",
            confirm_carrefoursa: (info) => `Your CarrefourSA (${info}) information has been saved. You will be informed about relevant campaigns!`,
            prompt_swissair: "Please enter your Swiss Air special passenger program number:",
            confirm_swissair: (no) => `Your Swiss Air (${no}) passenger program registration has been received. Have a good flight!`,
            prompt_carrefour_eu: "Please enter your Carrefour Card (Europe) number:",
            confirm_carrefour_eu: (no) => `Your Carrefour Europe (${no}) card information has been saved. Stay tuned for regional campaigns!`,
            prompt_tiktak: "Please enter your GSM number registered to TikTak:",
            confirm_tiktak: (gsm) => `Your TikTak (${gsm}) registration has been received. Good luck with your usage!`,
            prompt_trendyol: "Please enter your e-mail address registered to Trendyol:",
            confirm_trendyol: (mail) => `Your Trendyol (${mail}) e-mail address has been saved. Check your account for special discounts!`,
            prompt_csa_algida: "Please enter your CarrefourSA Card registered GSM number or Card number (Algida Campaign):",
            confirm_csa_algida: (num) => `Your participation is received! Our automated systems will credit the 300 TL worth of Algida points to your card for the number (${num}) shortly.`,
            help_text: "Available Commands:\n/help - Show this help message.\n/myinfo - Show your registered info.\n/reset - Delete all your registered info.\n/sponsors - List sponsor registration commands.\n/rewards - Show active reward opportunities.\n/lang [en/tr] - Change language.\n/upload - Upload a photo.\n/filter - Apply contrast adjustment.",
            sponsor_list_text: "Sponsor Registrations:\n/turkish - Miles&Smiles No\n/mavi - Mavi GSM\n/carrefoursa - C.SA Card/GSM\n/swiss - Swiss Air No\n/carrefour_eu - Carrefour Europe Card\n/tiktak - TikTak GSM\n/trendyol - Trendyol E-mail",
            rewards_text: "Active Reward Opportunity:\n- CarrefourSA & Algida: 300TL Point Opportunity! (/csa_algida)",
            my_info_title_basic: "--- Your Basic Info ---",
            my_info_name: "Name:",
            my_info_platform: "Platform:",
            my_info_username: "Username:",
            my_info_title_sponsor: "--- Your Sponsor Registrations ---",
            my_info_sponsor_tk: "THY (M&S):",
            my_info_sponsor_mavi: "Mavi (GSM):",
            my_info_sponsor_csa: "C.SA (Card/GSM):",
            my_info_sponsor_swiss: "Swiss Air (No):",
            my_info_sponsor_ceu: "C. EU (Card):",
            my_info_sponsor_tiktak: "TikTak (GSM):",
            my_info_sponsor_trendyol: "Trendyol (Mail):",
            not_registered: "Not Registered",
            not_registered_short: "-",
            unknown_command: (cmd) => `Unknown command: "${cmd}". Type /help for assistance.`,
            greeting_hello: (name) => `Hello ${name||''}!`,
            greeting_how_are_you: "I'm doing well, thanks for asking! How are you?",
            generic_reply_api_off: "Currently, I can only respond to specific commands and greetings, but you can use commands: /help, /sponsors, /rewards",
            api_fail_generic: "Sorry, I couldn't get a response.",
            api_fail_error: (err) => `Sorry, I can't answer you right now. Error: ${err}`,
            content_blocked: (reason) => `Content blocked due to safety reasons: ${reason}`,
            model_loading: "The model is currently loading, please try again in a few seconds...",
            lang_set_tr: "Dil Türkçe olarak ayarlandı.",
            lang_set_en: "Language set to English.",
            lang_fail: "Unsupported language code. Please use 'en' or 'tr'.",
            generic_replies: ["I see.", "Hmm, okay.", "Interesting point.", "Noted.", "Alright.", "You can continue...", "Okay, any other topic?"],
            input_placeholder: "Type your message...",
            image_uploaded: "Photo uploaded! Press 'Send' to send.",
            filter_applied: "Contrast adjustment applied!",
            no_image: "Please upload a photo first!",
            deepsearching: "Searching...",
            thinking: "Thinking..."
        }
    };

    // --- Temel Fonksiyonlar ---
    function saveData(key, value) { try { localStorage.setItem(key, value); console.log(`kaydedildi: ${key}=${value}`); } catch (e) { console.error("kayıt hatası:", e); } }
    function loadData(key) { try { return localStorage.getItem(key); } catch (e) { console.error("okuma hatası:", e); return null; } }
    function removeData(key) { try { localStorage.removeItem(key); console.log(`silindi: ${key}`); } catch (e) { console.error("silme hatası:", e); } }
    function removeAllSponsorData() {
        removeData(TK_MILES_KEY);
        removeData(MAVI_GSM_KEY);
        removeData(CARREFOURSA_INFO_KEY);
        removeData(SWISSAIR_NO_KEY);
        removeData(CARREFOUR_EU_KEY);
        removeData(TIKTAK_GSM_KEY);
        removeData(TRENDYOL_EMAIL_KEY);
        removeData(CSA_ALGIDA_KEY);
    }
    function addMessage(text, role, imageSrc = null) {
        if (!text && !imageSrc) return;
        const messageClass = role === 'user' ? 'user-message' : 'bot-message';
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', messageClass);
        const contentWrapper = document.createElement('div');
        if (imageSrc) {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '10px';
            contentWrapper.appendChild(img);
        }
        if (text) {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const timestampSpan = document.createElement('span');
            timestampSpan.classList.add('timestamp');
            timestampSpan.textContent = timestamp;
            contentWrapper.appendChild(paragraph);
            contentWrapper.appendChild(timestampSpan);
        }
        messageElement.appendChild(contentWrapper);
        chatBox.appendChild(messageElement);
        if (role === 'user' || role === 'model') {
            chatHistory.push({ role, parts: [{ text: text || '', imageSrc }] });
            if (chatHistory.length > MAX_HISTORY_LENGTH) chatHistory = chatHistory.slice(-MAX_HISTORY_LENGTH);
        }
        scrollToBottom();
    }
    function scrollToBottom() { chatBox.scrollTop = chatBox.scrollHeight; }
    function applyTheme() { document.body.classList.toggle('light-mode', isLightMode); }
    function updateStaticTexts() {
        if (userInput) userInput.placeholder = translations[currentLang].input_placeholder;
    }

    // --- Fotoğraf İşleme ---
    uploadButton.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage = e.target.result;
                previewImg.src = originalImage;
                pendingImage = originalImage; // Gönderilecek fotoğrafı sakla
                imagePreview.style.display = 'block';
                filterButton.style.display = 'inline-block';
                sendPhotoButton.style.display = 'inline-block';
                addMessage(translations[currentLang].image_uploaded, 'model');
            };
            reader.readAsDataURL(file);
        }
    });

    sendPhotoButton.addEventListener('click', async () => {
        if (pendingImage) {
            addMessage(null, 'user', pendingImage);
            const userMessage = userInput.value.trim();
            if (userMessage) {
                addMessage(userMessage, 'user');
                userInput.value = '';
            }

            // Gemini API'ye hem metni hem de görseli gönder
            const base64Image = pendingImage.split(',')[1];
            const response = await getGeminiResponseWithImage(userMessage || "Bu görseli analiz et.", base64Image);
            addMessage(response || translations[currentLang].api_fail_generic, 'model');

            imagePreview.style.display = 'none';
            filterButton.style.display = 'none';
            sendPhotoButton.style.display = 'none';
            pendingImage = null;
        }
    });

    filterButton.addEventListener('click', () => {
        if (previewImg.src) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = previewImg.src;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg * 1.2; // Kontrast artışı
                    data[i + 1] = avg * 1.2;
                    data[i + 2] = avg * 1.2;
                }
                ctx.putImageData(imageData, 0, 0);
                previewImg.src = canvas.toDataURL();
                pendingImage = canvas.toDataURL(); // Güncellenmiş görseli sakla
                addMessage(translations[currentLang].filter_applied, 'model');
            };
        }
    });

    // Gemini API ile Görsel ve Metin Analizi
    async function getGeminiResponseWithImage(text, base64Image) {
        const payload = {
            contents: [{
                role: 'user',
                parts: [
                    { text: text },
                    { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
                ]
            }]
        };
        try {
            if (!GEMINI_API_KEY || GEMINI_API_KEY === 'SENIN_GEMINI_API_ANAHTARIN') {
                throw new Error(translations[currentLang].api_fail_error("API Anahtarı ayarlanmamış veya geçersiz."));
            }
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Hatası: ${response.status} - ${errorData?.error?.message || response.statusText}`);
            }
            const data = await response.json();
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else if (data.promptFeedback && data.promptFeedback.blockReason) {
                return translations[currentLang].content_blocked(data.promptFeedback.blockReason);
            }
            return translations[currentLang].api_fail_generic;
        } catch (error) {
            console.error('Gemini API hatası:', error);
            return translations[currentLang].api_fail_error(error.message);
        }
    }

    // DeepSearch ve Think
    deepsearchButton.addEventListener('click', async () => {
        const lastMessage = chatHistory[chatHistory.length - 1]?.parts[0]?.text;
        if (lastMessage) {
            addMessage(translations[currentLang].deepsearching, 'model');
            const searchPrompt = `Web'de "${lastMessage}" ile ilgili özet bir bilgi ara.`;
            const response = await getGeminiResponse(searchPrompt);
            addMessage(response || translations[currentLang].api_fail_generic, 'model');
        }
    });

    thinkButton.addEventListener('click', async () => {
        const lastMessage = chatHistory[chatHistory.length - 1]?.parts[0]?.text;
        if (lastMessage) {
            addMessage(translations[currentLang].thinking, 'model');
            await new Promise(resolve => setTimeout(resolve, 5000));
            const thinkPrompt = `Şu mesajı detaylı bir şekilde analiz et ve derinlemesine bir cevap ver: "${lastMessage}"`;
            const response = await getGeminiResponse(thinkPrompt);
            addMessage(response || translations[currentLang].api_fail_generic, 'model');
        }
    });

    // Gemini API ile Metin Yanıtı
    async function getGeminiResponse(prompt) {
        const payload = {
            contents: chatHistory.map(item => ({
                role: item.role,
                parts: [{ text: item.parts[0].text || prompt }]
            }))
        };
        try {
            if (!GEMINI_API_KEY || GEMINI_API_KEY === 'SENIN_GEMINI_API_ANAHTARIN') {
                throw new Error(translations[currentLang].api_fail_error("API Anahtarı ayarlanmamış veya geçersiz."));
            }
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Hatası: ${response.status} - ${errorData?.error?.message || response.statusText}`);
            }
            const data = await response.json();
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else if (data.promptFeedback && data.promptFeedback.blockReason) {
                return translations[currentLang].content_blocked(data.promptFeedback.blockReason);
            }
            return translations[currentLang].api_fail_generic;
        } catch (error) {
            console.error('Gemini API hatası:', error);
            return translations[currentLang].api_fail_error(error.message);
        }
    }

    // --- Mesaj Gönderme Ana Mantığı ---
    function sendMessage() {
        if (!userInput) return;
        const messageText = userInput.value.trim();
        if (messageText !== "" || pendingImage) {
            if (messageText) {
                addMessage(messageText, 'user');
                userInput.value = '';
            }

            // Eğer bir fotoğraf varsa, bunu zaten sendPhotoButton ile gönderiyoruz
            if (!pendingImage) {
                // Komut kontrolü veya normal sohbet
                if (messageText.startsWith('/')) {
                    handleCommand(messageText);
                } else {
                    handleConversation(messageText);
                }
            }
        }
    }

    function handleCommand(messageText) {
        const parts = messageText.substring(1).toLowerCase().trim().split(' ');
        const command = parts[0];
        const args = parts.slice(1);
        let commandHandled = true;
        switch (command) {
            case 'help':
                addMessage(translations[currentLang].help_text, 'model');
                break;
            case 'sponsors':
                addMessage(translations[currentLang].sponsor_list_text, 'model');
                break;
            case 'rewards':
                addMessage(translations[currentLang].rewards_text, 'model');
                break;
            case 'myinfo':
                let cTkM = loadData(TK_MILES_KEY);
                let cMvG = loadData(MAVI_GSM_KEY);
                let cCsI = loadData(CARREFOURSA_INFO_KEY);
                let cSnN = loadData(SWISSAIR_NO_KEY);
                let cCeE = loadData(CARREFOUR_EU_KEY);
                let cTgG = loadData(TIKTAK_GSM_KEY);
                let cTeE = loadData(TRENDYOL_EMAIL_KEY);
                let info = translations[currentLang].my_info_title_basic + "\n";
                info += `${translations[currentLang].my_info_name} ${currentUserName || translations[currentLang].not_registered_short}\n`;
                info += `${translations[currentLang].my_info_platform} ${currentSocialMedia || translations[currentLang].not_registered_short}\n`;
                info += `${translations[currentLang].my_info_username} ${currentSocialUser || translations[currentLang].not_registered_short}\n`;
                info += translations[currentLang].my_info_title_sponsor + "\n";
                info += `${translations[currentLang].my_info_sponsor_tk} ${cTkM || translations[currentLang].not_registered_short}\n`;
                info += `${translations[currentLang].my_info_sponsor_mavi} ${cMvG || translations[currentLang].not_registered_short}\n`;
                info += `${translations[currentLang].my_info_sponsor_csa} ${cCsI || translations[currentLang].not_registered_short}\n`;
                info += `${translations[currentLang].my_info_sponsor_swiss} ${cSnN || translations[currentLang].not_registered_short}\n`;
                info += `${translations[currentLang].my_info_sponsor_ceu} ${cCeE || translations[currentLang].not_registered_short}\n`;
                info += `${translations[currentLang].my_info_sponsor_tiktak} ${cTgG || translations[currentLang].not_registered_short}\n`;
                info += `${translations[currentLang].my_info_sponsor_trendyol} ${cTeE || translations[currentLang].not_registered_short}`;
                addMessage(info, 'model');
                break;
            case 'reset':
                addMessage(translations[currentLang].reset_confirm, 'model');
                conversationState = 'awaiting_reset_confirmation';
                break;
            case 'turkish':
                addMessage(translations[currentLang].prompt_tk, 'model');
                conversationState = 'awaiting_tk_no';
                break;
            case 'mavi':
                addMessage(translations[currentLang].prompt_mavi, 'model');
                conversationState = 'awaiting_mavi_gsm';
                break;
            case 'carrefoursa':
                addMessage(translations[currentLang].prompt_carrefoursa, 'model');
                conversationState = 'awaiting_carrefoursa_info';
                break;
            case 'swiss':
                addMessage(translations[currentLang].prompt_swissair, 'model');
                conversationState = 'awaiting_swissair_no';
                break;
            case 'carrefour_eu':
                addMessage(translations[currentLang].prompt_carrefour_eu, 'model');
                conversationState = 'awaiting_carrefour_eu';
                break;
            case 'tiktak':
                addMessage(translations[currentLang].prompt_tiktak, 'model');
                conversationState = 'awaiting_tiktak_gsm';
                break;
            case 'trendyol':
                addMessage(translations[currentLang].prompt_trendyol, 'model');
                conversationState = 'awaiting_trendyol_email';
                break;
            case 'csa_algida':
                addMessage(translations[currentLang].prompt_csa_algida, 'model');
                conversationState = 'awaiting_carrefour_no';
                break;
            case 'lang':
                if (args.length > 0 && (args[0] === 'en' || args[0] === 'tr')) {
                    currentLang = args[0];
                    saveData(LANG_KEY, currentLang);
                    addMessage(currentLang === 'en' ? translations.en.lang_set_en : translations.tr.lang_set_tr, 'model');
                    updateStaticTexts();
                    if (conversationState === 'awaiting_name') addMessage(translations[currentLang].ask_name, 'model', 100);
                    else if (conversationState === 'awaiting_social') addMessage(translations[currentLang].ask_social(currentUserName), 'model', 100);
                    else if (conversationState === 'awaiting_username') addMessage(translations[currentLang].ask_username(currentSocialMedia), 'model', 100);
                } else {
                    addMessage(translations[currentLang].lang_fail, 'model');
                }
                break;
            case 'upload':
                uploadButton.click();
                break;
            case 'filter':
                if (previewImg.src) filterButton.click();
                else addMessage(translations[currentLang].no_image, 'model');
                break;
            default:
                addMessage(translations[currentLang].unknown_command(command), 'model');
                commandHandled = false;
        }
        if (commandHandled) return;
    }

    function handleConversation(messageText) {
        if (conversationState === 'awaiting_name') {
            currentUserName = messageText;
            saveData(USER_NAME_KEY, currentUserName);
            addMessage(translations[currentLang].ask_social(currentUserName), 'model', 100);
            conversationState = 'awaiting_social';
        } else if (conversationState === 'awaiting_social') {
            const lci = messageText.toLowerCase();
            if (allowedSocialMedia.includes(lci)) {
                currentSocialMedia = lci;
                saveData(SOCIAL_MEDIA_KEY, currentSocialMedia);
                addMessage(translations[currentLang].ask_username(currentSocialMedia), 'model', 100);
                conversationState = 'awaiting_username';
            } else {
                addMessage(translations[currentLang].prompt_social, 'model');
            }
        } else if (conversationState === 'awaiting_username') {
            currentSocialUser = messageText;
            saveData(SOCIAL_USER_KEY, currentSocialUser);
            addMessage(translations[currentLang].onboarding_complete(currentUserName), 'model');
            addMessage(translations[currentLang].welcome_back(currentUserName), 'model', 100);
            conversationState = 'idle';
        } else if (conversationState === 'awaiting_reset_confirmation') {
            const lci = messageText.toLowerCase();
            if (lci === 'evet' || lci === 'yes') {
                removeData(USER_NAME_KEY);
                removeData(SOCIAL_MEDIA_KEY);
                removeData(SOCIAL_USER_KEY);
                removeAllSponsorData();
                currentUserName = null;
                currentSocialMedia = null;
                currentSocialUser = null;
                addMessage(translations[currentLang].reset_done, 'model');
                conversationState = 'idle';
                setTimeout(startConversation, 800);
            } else {
                addMessage(translations[currentLang].reset_cancel, 'model');
                conversationState = 'idle';
            }
        } else if (conversationState === 'awaiting_tk_no') {
            const tkNo = messageText;
            saveData(TK_MILES_KEY, tkNo);
            addMessage(translations[currentLang].confirm_tk(tkNo), 'model');
            conversationState = 'idle';
        } else if (conversationState === 'awaiting_mavi_gsm') {
            const maviGsm = messageText;
            saveData(MAVI_GSM_KEY, maviGsm);
            addMessage(translations[currentLang].confirm_mavi(maviGsm), 'model');
            conversationState = 'idle';
        } else if (conversationState === 'awaiting_carrefoursa_info') {
            const csInfo = messageText;
            saveData(CARREFOURSA_INFO_KEY, csInfo);
            addMessage(translations[currentLang].confirm_carrefoursa(csInfo), 'model');
            conversationState = 'idle';
        } else if (conversationState === 'awaiting_swissair_no') {
            const swissNo = messageText;
            saveData(SWISSAIR_NO_KEY, swissNo);
            addMessage(translations[currentLang].confirm_swissair(swissNo), 'model');
            conversationState = 'idle';
        } else if (conversationState === 'awaiting_carrefour_eu') {
            const cEuNo = messageText;
            saveData(CARREFOUR_EU_KEY, cEuNo);
            addMessage(translations[currentLang].confirm_carrefour_eu(cEuNo), 'model');
            conversationState = 'idle';
        } else if (conversationState === 'awaiting_tiktak_gsm') {
            const tiktakGsm = messageText;
            saveData(TIKTAK_GSM_KEY, tiktakGsm);
            addMessage(translations[currentLang].confirm_tiktak(tiktakGsm), 'model');
            conversationState = 'idle';
        } else if (conversationState === 'awaiting_trendyol_email') {
            const trendyolMail = messageText;
            saveData(TRENDYOL_EMAIL_KEY, trendyolMail);
            addMessage(translations[currentLang].confirm_trendyol(trendyolMail), 'model');
            conversationState = 'idle';
        } else if (conversationState === 'awaiting_carrefour_no') {
            const enteredNumber = messageText;
            saveData(CSA_ALGIDA_KEY, enteredNumber);
            addMessage(translations[currentLang].confirm_csa_algida(enteredNumber), 'model');
            conversationState = 'idle';
        } else if (conversationState === 'idle') {
            const lowerCaseInput = messageText.toLowerCase();
            let greetingHandled = true;
            if (lowerCaseInput === 'merhaba' || lowerCaseInput === 'selam' || lowerCaseInput === 'hello' || lowerCaseInput === 'hi') {
                addMessage(translations[currentLang].greeting_hello(currentUserName), 'model');
            } else if (lowerCaseInput === 'naber' || lowerCaseInput === 'nasılsın' || lowerCaseInput.includes('how are you')) {
                addMessage(translations[currentLang].greeting_how_are_you, 'model');
            } else {
                greetingHandled = false;
            }

            if (!greetingHandled) {
                if (GEMINI_API_KEY && GEMINI_API_KEY !== 'SENIN_GEMINI_API_ANAHTARIN') {
                    getGeminiResponse(messageText);
                } else {
                    addMessage(translations[currentLang].generic_replies[Math.floor(Math.random() * translations[currentLang].generic_replies.length)], 'model');
                }
            }
        }
    }

    // Olay Dinleyicileri
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') sendMessage(); });
    toggleTheme.addEventListener('click', () => {
        isLightMode = !isLightMode;
        applyTheme();
    });

    // --- Konuşmayı Başlatma Fonksiyonu ---
    function startConversation() {
        chatHistory = [];
        let initialWelcome = translations[currentLang].welcome_new;
        if (currentLang === 'tr') initialWelcome += "\n(For English, type /lang en)";
        else initialWelcome += "\n(Türkçe için /lang tr yazın)";
        addMessage(initialWelcome, 'model');
        if (!currentUserName) {
            addMessage(translations[currentLang].ask_name, 'model', 100);
            conversationState = 'awaiting_name';
        } else if (!currentSocialMedia) {
            addMessage(translations[currentLang].ask_social(currentUserName), 'model', 100);
            conversationState = 'awaiting_social';
        } else if (!currentSocialUser) {
            addMessage(translations[currentLang].ask_username(currentSocialMedia), 'model', 100);
            conversationState = 'awaiting_username';
        } else {
            addMessage(translations[currentLang].welcome_back(currentUserName), 'model', 100);
            conversationState = 'idle';
        }
        setTimeout(scrollToBottom, 150);
    }

    // Başlangıç
    currentUserName = loadData(USER_NAME_KEY);
    currentSocialMedia = loadData(SOCIAL_MEDIA_KEY);
    currentSocialUser = loadData(SOCIAL_USER_KEY);
    currentLang = loadData(LANG_KEY) || 'tr';
    updateStaticTexts();
    applyTheme();
    startConversation();
});
