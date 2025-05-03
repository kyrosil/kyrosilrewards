// Gerekli HTML elementlerini seçiyoruz
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Mesaj gönderme fonksiyonu
function sendMessage() {
    // Kullanıcının girdiği metni alıyoruz (başındaki/sonundaki boşlukları temizleyerek)
    const messageText = userInput.value.trim();

    // Mesaj boş değilse devam et
    if (messageText !== "") {
        // Yeni bir mesaj elementi oluştur (kullanıcı mesajı olarak)
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'user-message'); // Hem genel hem kullanıcı stili
        
        const paragraph = document.createElement('p');
        paragraph.textContent = messageText; // Paragrafın içeriğini kullanıcının mesajı yap
        messageElement.appendChild(paragraph); // Paragrafı mesaj elementine ekle

        // Oluşturulan mesaj elementini sohbet kutusuna ekle
        chatBox.appendChild(messageElement);

        // Sohbet kutusunu en alta kaydır
        scrollToBottom();

        // Yazı yazma kutusunu temizle
        userInput.value = '';

        // --- BOT CEVABI İÇİN GELECEK KOD BURAYA EKLENEBİLİR ---
        // Şimdilik bot cevap vermiyor.
        // generateBotResponse(messageText); // Örneğin sonra böyle bir fonksiyon çağırabiliriz
    }
}

// Sohbet kutusunu en alta kaydıran yardımcı fonksiyon
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Gönder butonuna tıklandığında sendMessage fonksiyonunu çalıştır
sendButton.addEventListener('click', sendMessage);

// Yazı kutusundayken Enter tuşuna basıldığında sendMessage fonksiyonunu çalıştır
userInput.addEventListener('keypress', function(event) {
    // Enter tuşunun kodu 13'tür
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Sayfa ilk yüklendiğinde de en alta kaydır (eğer başta mesajlar varsa)
scrollToBottom();
