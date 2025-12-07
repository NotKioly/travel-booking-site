/* =========================================
   CHATBOT LOGIC (AUTO REPLY)
   ========================================= */

// Hàm mở/đóng chat (Gắn vào window để gọi từ HTML được)
window.toggleChat = function() {
    const chatWidget = document.getElementById("chatWidget");
    if (chatWidget.style.display === "none" || chatWidget.style.display === "") {
        chatWidget.style.display = "block";
        // Nếu chưa có tin nhắn nào thì Bot chào trước
        const chatBody = document.getElementById("chatBody");
        if(chatBody.children.length === 0) {
            addBotMessage("Xin chào! 👋 Tôi là trợ lý ảo của GreenTrip. Bạn cần tư vấn thông tin gì ạ?");
        }
    } else {
        chatWidget.style.display = "none";
    }
}

// Xử lý khi nhấn Enter
window.handleChat = function(event) {
    if (event.key === "Enter") {
        sendUserMessage();
    }
}

// Gửi tin nhắn của người dùng
window.sendUserMessage = function() {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (text === "") return;

    // 1. Hiện tin nhắn người dùng
    addUserMessage(text);
    input.value = "";

    // 2. Bot trả lời tự động sau 1 giây
    setTimeout(() => {
        botReplyLogic(text);
    }, 1000);
}

// Hiển thị tin nhắn User
function addUserMessage(text) {
    const chatBody = document.getElementById("chatBody");
    const div = document.createElement("div");
    div.className = "message-user";
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight; // Cuộn xuống cuối
}

// Hiển thị tin nhắn Bot
function addBotMessage(text) {
    const chatBody = document.getElementById("chatBody");
    const div = document.createElement("div");
    div.className = "message-bot";
    div.innerHTML = text; // Dùng innerHTML để hiển thị link/số điện thoại đậm
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// KỊCH BẢN TRẢ LỜI TỰ ĐỘNG
function botReplyLogic(userText) {
    // Chuyển về chữ thường để dễ so sánh
    const lowerText = userText.toLowerCase();

    if (lowerText.includes("giá") || lowerText.includes("bao nhiêu") || lowerText.includes("tiền")) {
        addBotMessage("Dạ, giá tour hiện đang được ưu đãi giảm 10% nếu đặt online hôm nay ạ! 💰");
        setTimeout(() => {
            givePhoneNumber();
        }, 1500);
    } 
    else if (lowerText.includes("lịch trình") || lowerText.includes("đi đâu")) {
        addBotMessage("Lịch trình bên em thiết kế rất linh hoạt và tối ưu trải nghiệm. Bạn có thể xem chi tiết ở mục 'Lịch trình' trên trang nhé!");
        setTimeout(() => {
            givePhoneNumber();
        }, 2000);
    }
    else if (lowerText.includes("xin chào") || lowerText.includes("hi") || lowerText.includes("hello")) {
        addBotMessage("Chào bạn! Bạn đang quan tâm đến tour nào để mình tư vấn kỹ hơn ạ?");
    }
    else {
        // Câu trả lời mặc định -> Dẫn đến số điện thoại
        addBotMessage("Cảm ơn bạn đã quan tâm. Để được tư vấn chi tiết nhất và nhận ưu đãi riêng, bạn vui lòng liên hệ hotline miễn phí nhé!");
        setTimeout(() => {
            givePhoneNumber();
        }, 1000);
    }
}

// Hàm đưa số điện thoại (Chốt sales)
function givePhoneNumber() {
    addBotMessage(`
        📞 <strong>HOTLINE MIỄN PHÍ:</strong><br>
        <a href="tel:0347348147" style="color: #00A651; font-weight: bold; font-size: 1.1rem; text-decoration: none;">0347.348.147</a><br>
        <span style="font-size: 0.85rem; color: #666;">(Bấm vào số để gọi ngay)</span>
    `);
}
