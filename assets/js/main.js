/* =========================================
   MAIN.JS - GREENTRIP (FULL FINAL VERSION)
   ========================================= */
import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. CƠ SỞ DỮ LIỆU 9 TOUR (DATABASE FRONTEND) ---
const toursData = {
    "T001": { 
        name: "Đà Lạt - Thành Phố Ngàn Hoa", price: 1500000, duration: "3 Ngày 2 Đêm", location: "Lâm Đồng", type: "Núi",
        img: "assets/img/tour1.jpg", 
        highlights: ["Săn mây Cầu Đất", "Quảng trường Lâm Viên", "Vườn hoa Cẩm Tú Cầu", "Thác Datanla"],
        itinerary: [{day:"Ngày 1", title:"TP.HCM - Đà Lạt", content:"Đón khách, di chuyển lên Đà Lạt. Tham quan Quảng trường Lâm Viên."}, {day:"Ngày 2", title:"Săn Mây", content:"Săn mây Cầu Đất. Chiều tham quan vườn hoa, Đường hầm điêu khắc."}, {day:"Ngày 3", title:"Thác Datanla", content:"Trải nghiệm máng trượt thác Datanla. Mua sắm đặc sản. Về TP.HCM."}]
    },
    "T002": { 
        name: "Nha Trang - Biển Gọi", price: 2300000, duration: "3 Ngày 2 Đêm", location: "Khánh Hòa", type: "Biển",
        img: "assets/img/tour2.jpg", 
        highlights: ["Vinwonders", "Lặn ngắm san hô", "Tắm bùn khoáng", "Bar nổi"],
        itinerary: [{day:"Ngày 1", title:"Vinwonders", content:"Tham quan Vinwonders, xem biểu diễn cá heo."}, {day:"Ngày 2", title:"3 Đảo", content:"Hòn Mun, Hòn Một. Tắm biển, lặn ngắm san hô."}, {day:"Ngày 3", title:"City Tour", content:"Tháp Bà Ponagar, Nhà thờ Núi. Mua sắm Chợ Đầm."}]
    },
    "T003": { 
        name: "Phú Quốc - Đảo Ngọc", price: 3800000, duration: "4 Ngày 3 Đêm", location: "Kiên Giang", type: "Biển",
        img: "assets/img/tour3.jpg", 
        highlights: ["Cáp treo Hòn Thơm", "Grand World", "Bãi Sao", "Sunset Sanato"],
        itinerary: [{day:"Ngày 1", title:"Grand World", content:"Đón sân bay. Tối tham quan Thành phố không ngủ."}, {day:"Ngày 2", title:"Nam Đảo", content:"Câu cá, lặn ngắm san hô tại Nam Đảo."}, {day:"Ngày 3", title:"Hòn Thơm", content:"Cáp treo vượt biển dài nhất thế giới. Công viên nước Aquatopia."}, {day:"Ngày 4", title:"Tạm biệt", content:"Tự do tắm biển, mua sắm. Tiễn sân bay."}]
    },
    "T004": { 
        name: "Hạ Long - Kỳ Quan", price: 2500000, duration: "2 Ngày 1 Đêm", location: "Quảng Ninh", type: "Biển",
        img: "assets/img/tour4.jpg", 
        highlights: ["Du thuyền 5 sao", "Hang Sửng Sốt", "Đảo Ti Tốp", "Chèo Kayak"],
        itinerary: [{day:"Ngày 1", title:"Vịnh Hạ Long", content:"Lên du thuyền, ăn trưa. Tham quan Hang Sửng Sốt."}, {day:"Ngày 2", title:"Ti Tốp", content:"Leo núi Ti Tốp ngắm toàn cảnh, tắm biển. Chèo Kayak."}]
    },
    "T005": { 
        name: "Sapa - Fansipan Legend", price: 1800000, duration: "3 Ngày 2 Đêm", location: "Lào Cai", type: "Núi",
        img: "assets/img/tour5.jpg", 
        highlights: ["Đỉnh Fansipan", "Bản Cát Cát", "Nhà thờ Đá", "Thung lũng Mường Hoa"],
        itinerary: [{day:"Ngày 1", title:"Hàm Rồng", content:"Xe giường nằm đi Sapa. Chiều leo núi Hàm Rồng."}, {day:"Ngày 2", title:"Fansipan", content:"Cáp treo chinh phục nóc nhà Đông Dương. Săn mây."}, {day:"Ngày 3", title:"Cát Cát", content:"Thăm bản làng người H'Mông. Tìm hiểu văn hóa bản địa."}]
    },
    "T006": { 
        name: "Nhật Bản - Mùa Hoa", price: 25000000, duration: "5 Ngày 4 Đêm", location: "Nhật Bản", type: "Quốc tế",
        img: "assets/img/tour6.jpg", 
        highlights: ["Núi Phú Sĩ", "Chùa Vàng", "Phố cổ Kyoto", "Shopping Ginza"],
        itinerary: [{day:"Ngày 1", title:"Tokyo", content:"Chùa Asakusa, tháp Tokyo Skytree."}, {day:"Ngày 2", title:"Núi Phú Sĩ", content:"Làng cổ Oshino Hakkai, tắm Onsen."}, {day:"Ngày 3", title:"Kyoto", content:"Chùa Vàng Kinkakuji, Rừng tre Arashiyama."}, {day:"Ngày 4", title:"Osaka", content:"Lâu đài Osaka. Mua sắm Shinsaibashi."}, {day:"Ngày 5", title:"Về VN", content:"Ra sân bay Kansai. Kết thúc chuyến đi."}]
    },
    "T007": { 
        name: "Thái Lan - Bangkok Pattaya", price: 6500000, duration: "4 Ngày 3 Đêm", location: "Thái Lan", type: "Quốc tế",
        img: "assets/img/tour7.jpg", 
        highlights: ["Đảo Coral", "Chùa Phật Vàng", "Show Alcazar", "Buffet 86 tầng"],
        itinerary: [{day:"Ngày 1", title:"Bangkok", content:"Bay đến Bangkok. Di chuyển đi Pattaya. Chợ Nổi."}, {day:"Ngày 2", title:"Đảo Coral", content:"Cano đi đảo Coral tắm biển. Massage Thái cổ truyền."}, {day:"Ngày 3", title:"Pattaya", content:"Trân Bảo Phật Sơn. Ăn Buffet Baiyoke Sky."}, {day:"Ngày 4", title:"Về VN", content:"Viếng Chùa Phật Vàng. Ra sân bay."}]
    },
    "T008": { 
        name: "Miền Tây Sông Nước", price: 1200000, duration: "2 Ngày 1 Đêm", location: "Cần Thơ", type: "Nông thôn",
        img: "assets/img/tour8.jpg", 
        highlights: ["Chợ nổi Cái Răng", "Vườn trái cây", "Lò kẹo dừa", "Đờn ca tài tử"],
        itinerary: [{day:"Ngày 1", title:"Mỹ Tho - Bến Tre", content:"Cồn Thới Sơn, đi xuồng ba lá, thăm lò kẹo dừa. Nghe đờn ca tài tử."}, {day:"Ngày 2", title:"Cần Thơ", content:"5h sáng đi chợ nổi Cái Răng. Tham quan vườn trái cây. Về TP.HCM."}]
    },
    "T009": { 
        name: "Hà Nội - Phố Cổ", price: 800000, duration: "1 Ngày", location: "Hà Nội", type: "Thành thị",
        img: "assets/img/tour9.jpg", 
        highlights: ["Lăng Bác", "Hồ Gươm", "Văn Miếu", "Phố cổ", "Cafe Trứng"],
        itinerary: [{day:"Sáng", title:"Lăng Bác", content:"Viếng Lăng Bác, Chùa Một Cột, Văn Miếu Quốc Tử Giám."}, {day:"Chiều", title:"Phố Cổ", content:"Dạo quanh Hồ Gươm, Đền Ngọc Sơn. Khám phá ẩm thực phố cổ."}]
    }
};

document.addEventListener("DOMContentLoaded", function () {

    // --- 2. BANNER & BỘ LỌC THÔNG MINH ---
    const myCarouselElement = document.querySelector('#heroCarousel');
    if (myCarouselElement) new bootstrap.Carousel(myCarouselElement, { interval: 3000, ride: 'carousel', wrap: true });

    window.applyFilter = function() {
        const searchText = document.getElementById("searchTourInput").value.toLowerCase();
        const filterType = document.getElementById("filterType").value;
        const filterPrice = document.getElementById("filterPrice") ? document.getElementById("filterPrice").value : "all";
        
        const items = document.querySelectorAll(".tour-item"); 
        let count = 0;

        items.forEach(item => {
            const title = item.querySelector(".tour-title").innerText.toLowerCase();
            const type = item.getAttribute("data-type");
            const price = parseInt(item.getAttribute("data-price"));

            const matchName = title.includes(searchText);
            const matchType = filterType === "Tất cả" || filterType === "all" || type === filterType;
            
            let matchPrice = true;
            if(filterPrice === "under-2") matchPrice = price < 2000000;
            else if(filterPrice === "2-5") matchPrice = price >= 2000000 && price <= 5000000;
            else if(filterPrice === "5-10") matchPrice = price > 5000000 && price <= 10000000;
            else if(filterPrice === "over-10") matchPrice = price > 10000000;

            if (matchName && matchType && matchPrice) {
                item.style.display = "block";
                count++;
            } else {
                item.style.display = "none";
            }
        });

        // Hiện thông báo nếu không có kết quả
        const noRes = document.getElementById("noResults");
        if(noRes) noRes.style.display = count === 0 ? "block" : "none";
    }
    
    const searchInp = document.getElementById("searchTourInput");
    if(searchInp) searchInp.addEventListener("keyup", applyFilter);

    // --- 3. TRANG CHI TIẾT (tour-detail.html) ---
    const detailTitle = document.getElementById('detailTitle');
    if (detailTitle) {
        const params = new URLSearchParams(window.location.search);
        const tourId = params.get('id');
        const tour = toursData[tourId];

        if (tour) {
            document.getElementById('breadcrumbName').innerText = tour.name;
            detailTitle.innerText = tour.name;
            document.getElementById('detailLocation').innerText = tour.location;
            document.getElementById('detailDuration').innerText = tour.duration;
            document.getElementById('detailPrice').innerText = new Intl.NumberFormat('vi-VN').format(tour.price) + "đ";
            document.getElementById('detailImage').src = tour.img;

            const highlights = document.getElementById('detailHighlights');
            tour.highlights.forEach(h => highlights.innerHTML += `<div class="col-md-6 d-flex align-items-center mb-2"><i class="fas fa-check-circle text-success me-2"></i> ${h}</div>`);

            const itinerary = document.getElementById('tourItinerary');
            tour.itinerary.forEach((it, i) => {
                itinerary.innerHTML += `
                <div class="accordion-item border-0 shadow-sm mb-3 rounded overflow-hidden">
                    <h2 class="accordion-header"><button class="accordion-button ${i!==0?'collapsed':''} fw-bold bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#day${i}">
                        <span class="badge bg-primary me-3">${it.day}</span> ${it.title}
                    </button></h2>
                    <div id="day${i}" class="accordion-collapse collapse ${i===0?'show':''}" data-bs-parent="#tourItinerary">
                        <div class="accordion-body text-muted">${it.content}</div>
                    </div>
                </div>`;
            });

            const btnBook = document.getElementById('btnBookNow');
            if(btnBook) btnBook.href = `booking.html?id=${tourId}`;
        } else {
            detailTitle.innerText = "Không tìm thấy thông tin tour!";
        }
    }

    // --- 4. TRANG ĐẶT TOUR (booking.html - Gửi Firebase) ---
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        const tourId = new URLSearchParams(window.location.search).get('id');
        const tour = toursData[tourId];

        if (tour) {
            document.getElementById('summaryName').innerText = tour.name;
            document.getElementById('summaryImg').src = tour.img;
            document.getElementById('summaryDuration').innerText = tour.duration;
            document.getElementById('summaryPricePerPax').innerText = new Intl.NumberFormat('vi-VN').format(tour.price) + "đ";

            const calc = () => {
                const count = parseInt(document.getElementById('numPeople').value) || 1;
                document.getElementById('summaryTotal').innerText = new Intl.NumberFormat('vi-VN').format(count * tour.price) + "đ";
            };
            document.getElementById('numPeople').addEventListener('input', calc);
            calc();

            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = bookingForm.querySelector("button[type='submit']");
                btn.innerText = "Đang xử lý..."; btn.disabled = true;

                try {
                    await addDoc(collection(db, "bookings"), {
                        name: document.getElementById("customerName").value,
                        phone: document.getElementById("customerPhone").value,
                        email: document.getElementById("customerEmail").value,
                        note: document.getElementById("customerNote").value,
                        tourName: tour.name,
                        people: document.getElementById("numPeople").value,
                        total: document.getElementById("summaryTotal").innerText,
                        status: "pending",
                        createdAt: new Date().toLocaleString()
                    });
                    alert("✅ Đặt tour thành công! Admin sẽ liên hệ sớm.");
                    window.location.href = "index.html";
                } catch (err) {
                    alert("Lỗi kết nối! Vui lòng thử lại.");
                    btn.disabled = false;
                    btn.innerText = "XÁC NHẬN ĐẶT TOUR";
                }
            });
        }
    }

    // --- 5. CHATBOT TỰ ĐỘNG ---
    window.toggleChat = function() {
        const w = document.getElementById("chatWidget");
        w.style.display = (w.style.display === "none" || w.style.display === "") ? "block" : "none";
        if(w.style.display === "block" && document.getElementById("chatBody").children.length === 0) {
            addBotMsg("Xin chào! 👋 Tôi là trợ lý ảo GreenTrip. Bạn cần hỗ trợ gì?");
            showOptions(["💰 Giá tour", "📅 Lịch trình", "📞 Tư vấn viên"]);
        }
    }
    
    window.handleChat = function(e) { if(e.key === "Enter") sendUserMessage(); }
    
    window.handleOption = function(txt) { 
        const body = document.getElementById("chatBody");
        body.innerHTML += `<div class="message-user">${txt}</div>`;
        body.scrollTop = body.scrollHeight;
        setTimeout(() => { botReply(txt); }, 600);
    }

    window.sendUserMessage = function() {
        const inp = document.getElementById("chatInput");
        const txt = inp.value.trim();
        if(!txt) return;
        document.getElementById("chatBody").innerHTML += `<div class="message-user">${txt}</div>`;
        inp.value = "";
        document.getElementById("chatBody").scrollTop = document.getElementById("chatBody").scrollHeight;
        setTimeout(() => { botReply(txt); }, 800);
    }

    function botReply(txt) {
        const lower = txt.toLowerCase();
        let reply = "Để được hỗ trợ chi tiết, vui lòng liên hệ Hotline miễn phí bên dưới nhé!";
        
        if(lower.includes("giá") || lower.includes("ưu đãi")) {
            reply = "GreenTrip đang giảm 10% cho nhóm trên 5 khách ạ! 🎁";
            addBotMsg(reply);
            showOptions(["📞 Gặp tư vấn viên", "Đặt tour ngay"]);
        } else if(lower.includes("lịch trình")) {
            reply = "Bạn muốn xem lịch trình vùng nào?";
            addBotMsg(reply);
            showOptions(["Miền Bắc", "Miền Tây", "Biển Đảo"]);
        } else if(lower.includes("tư vấn") || lower.includes("gặp") || lower.includes("hotline")) {
            reply = "Dạ, mời bạn liên hệ qua số điện thoại bên dưới ạ:";
            addBotMsg(reply);
            setTimeout(() => addBotMsg(`📞 <strong>0347.348.147</strong>`), 500);
        } else {
            addBotMsg(reply);
            setTimeout(() => addBotMsg(`📞 <strong>0347.348.147</strong>`), 500);
        }
    }

    function addBotMsg(html) {
        const b = document.getElementById("chatBody");
        b.innerHTML += `<div class="message-bot">${html}</div>`;
        b.scrollTop = b.scrollHeight;
    }
    
    function showOptions(opts) {
        let html = `<div class="chat-options">`;
        opts.forEach(o => html += `<span class="chat-chip" onclick="handleOption('${o}')">${o}</span>`);
        html += `</div>`;
        document.getElementById("chatBody").innerHTML += html;
        document.getElementById("chatBody").scrollTop = document.getElementById("chatBody").scrollHeight;
    }

    // --- 6. ĐĂNG NHẬP (BẢO MẬT) ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pass = document.querySelector('input[type="password"]').value;

            // Mã hóa Admin: admin@travel.com / admin123
            const SEC_EMAIL = "YWRtaW5AdHJhdmVsLmNvbQ=="; 
            const SEC_PASS = "YWRtaW4xMjM="; 

            if (btoa(email) === SEC_EMAIL && btoa(pass) === SEC_PASS) {
                localStorage.setItem("currentUser", JSON.stringify({ name: "Admin GreenTrip", role: "admin" }));
                window.location.href = "admin/dashboard.html";
            } else {
                // Kiểm tra user thường
                let users = JSON.parse(localStorage.getItem("listUsers")) || [];
                const user = users.find(u => u.email === email && u.password === pass);
                if (user) {
                    if(user.status === 'locked') { alert("Tài khoản bị khóa!"); return; }
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    alert(`Chào mừng ${user.name}!`);
                    window.location.href = "index.html";
                } else {
                    alert("Sai thông tin đăng nhập!");
                }
            }
        });
    }

    // --- 7. CHECK LOGIN MENU ---
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const authNav = document.querySelector(".navbar-nav .ms-2");
    if (currentUser && authNav) {
        authNav.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                    <i class="fas fa-user-circle"></i> ${currentUser.name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    ${currentUser.role === 'admin' ? '<li><a class="dropdown-item" href="admin/dashboard.html">Trang quản trị</a></li>' : ''}
                    <li><a class="dropdown-item" href="change-password.html">Đổi mật khẩu</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" id="btnLogout">Đăng xuất</a></li>
                </ul>
            </div>`;
        document.getElementById("btnLogout").addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    // --- 8. GÓP Ý (GỬI FIREBASE) ---
    const feedbackForm = document.getElementById("feedbackForm");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", async function(e){
            e.preventDefault();
            try {
                await addDoc(collection(db, "feedbacks"), {
                    name: document.getElementById("fbName").value,
                    email: document.getElementById("fbEmail").value,
                    subject: document.getElementById("fbSubject").value,
                    message: document.getElementById("fbMessage").value,
                    createdAt: new Date().toLocaleString()
                });
                alert("Cảm ơn bạn đã gửi góp ý!");
                feedbackForm.reset();
            } catch (err) { alert("Lỗi gửi tin nhắn."); }
        })
    }
});
