/* =========================================
   MAIN.JS - GREENTRIP (FULL FINAL VERSION)
   Chức năng: Database Tour, Booking (Discount), Chatbot, Auth, Feedback
   ========================================= */
import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. CƠ SỞ DỮ LIỆU 9 TOUR ---
const toursData = {
    "T001": { name: "Đà Lạt - Thành Phố Ngàn Hoa", price: 1500000, duration: "3N2Đ", location: "Lâm Đồng", type: "Núi", img: "assets/img/tour1.jpg", highlights: ["Săn mây Cầu Đất", "Quảng trường Lâm Viên"], itinerary: [{day:"Ngày 1", title:"TP.HCM - Đà Lạt", content:"Đón khách, di chuyển lên Đà Lạt."}] },
    "T002": { name: "Nha Trang - Biển Gọi", price: 2300000, duration: "3N2Đ", location: "Khánh Hòa", type: "Biển", img: "assets/img/tour2.jpg", highlights: ["Vinwonders", "Lặn ngắm san hô"], itinerary: [{day:"Ngày 1", title:"Vinwonders", content:"Tham quan Vinwonders."}] },
    "T003": { name: "Phú Quốc - Đảo Ngọc", price: 3800000, duration: "4N3Đ", location: "Kiên Giang", type: "Biển", img: "assets/img/tour3.jpg", highlights: ["Cáp treo Hòn Thơm", "Grand World"], itinerary: [{day:"Ngày 1", title:"Grand World", content:"Đón sân bay."}] },
    "T004": { name: "Hạ Long - Kỳ Quan", price: 2500000, duration: "2N1Đ", location: "Quảng Ninh", type: "Biển", img: "assets/img/tour4.jpg", highlights: ["Du thuyền 5 sao", "Hang Sửng Sốt"], itinerary: [{day:"Ngày 1", title:"Hà Nội - Vịnh Hạ Long", content:"Lên du thuyền, ăn trưa."}] },
    "T005": { name: "Sapa - Fansipan Legend", price: 1800000, duration: "3N2Đ", location: "Lào Cai", type: "Núi", img: "assets/img/tour5.jpg", highlights: ["Đỉnh Fansipan", "Bản Cát Cát"], itinerary: [{day:"Ngày 1", title:"Hàm Rồng", content:"Xe giường nằm đi Sapa."}] },
    "T006": { name: "Nhật Bản - Mùa Hoa", price: 25000000, duration: "5N4Đ", location: "Nhật Bản", type: "Quốc tế", img: "assets/img/tour6.jpg", highlights: ["Núi Phú Sĩ", "Chùa Vàng"], itinerary: [{day:"Ngày 1", title:"Tokyo", content:"Đáp sân bay Narita."}] },
    "T007": { name: "Thái Lan - Bangkok Pattaya", price: 6500000, duration: "4N3Đ", location: "Thái Lan", type: "Quốc tế", img: "assets/img/tour7.jpg", highlights: ["Đảo Coral", "Chùa Phật Vàng"], itinerary: [{day:"Ngày 1", title:"Bangkok", content:"Bay đến Bangkok."}] },
    "T008": { name: "Miền Tây Sông Nước", price: 1200000, duration: "2N1Đ", location: "Cần Thơ", type: "Nông thôn", img: "assets/img/tour8.jpg", highlights: ["Chợ nổi Cái Răng", "Vườn trái cây"], itinerary: [{day:"Ngày 1", title:"Mỹ Tho", content:"Cồn Thới Sơn."}] },
    "T009": { name: "Hà Nội - Phố Cổ", price: 800000, duration: "1 Ngày", location: "Hà Nội", type: "Thành thị", img: "assets/img/tour9.jpg", highlights: ["Lăng Bác", "Hồ Gươm"], itinerary: [{day:"Sáng", title:"Lăng Bác", content:"Viếng Lăng Bác."}] }
};

document.addEventListener("DOMContentLoaded", function () {

    // --- 2. BANNER & SEARCH ---
    const myCarouselElement = document.querySelector('#heroCarousel');
    if (myCarouselElement) new bootstrap.Carousel(myCarouselElement, { interval: 3000, ride: 'carousel', wrap: true });

    window.applyFilter = function() {
        const searchText = document.getElementById("searchTourInput").value.toLowerCase();
        const filterType = document.getElementById("filterType").value;
        const items = document.querySelectorAll(".tour-item");
        let count = 0;
        items.forEach(item => {
            const title = item.querySelector(".tour-title").innerText.toLowerCase();
            const type = item.getAttribute("data-type");
            const matchName = title.includes(searchText);
            const matchType = filterType === "Tất cả" || filterType === "all" || type === filterType;
            if (matchName && matchType) { item.style.display = "block"; count++; } 
            else { item.style.display = "none"; }
        });
        const noRes = document.getElementById("noResults");
        if(noRes) noRes.style.display = count === 0 ? "block" : "none";
    }
    const searchInp = document.getElementById("searchTourInput");
    if(searchInp) searchInp.addEventListener("keyup", applyFilter);

    // --- 3. TRANG CHI TIẾT ---
    const detailTitle = document.getElementById('detailTitle');
    if (detailTitle) {
        const tourId = new URLSearchParams(window.location.search).get('id');
        const tour = toursData[tourId];
        if (tour) {
            document.getElementById('breadcrumbName').innerText = tour.name;
            detailTitle.innerText = tour.name;
            document.getElementById('detailLocation').innerText = tour.location;
            document.getElementById('detailDuration').innerText = tour.duration;
            document.getElementById('detailPrice').innerText = new Intl.NumberFormat('vi-VN').format(tour.price) + "đ";
            document.getElementById('detailImage').src = tour.img;
            
            const hl = document.getElementById('detailHighlights');
            tour.highlights.forEach(h => hl.innerHTML += `<div class="col-md-6 d-flex align-items-center mb-2"><i class="fas fa-check-circle text-success me-2"></i> ${h}</div>`);
            
            const it = document.getElementById('tourItinerary');
            tour.itinerary.forEach((item, i) => {
                it.innerHTML += `<div class="accordion-item border-0 shadow-sm mb-3 rounded overflow-hidden">
                    <h2 class="accordion-header"><button class="accordion-button ${i!==0?'collapsed':''} fw-bold bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#day${i}">
                    <span class="badge bg-primary me-3">${item.day}</span> ${item.title}</button></h2>
                    <div id="day${i}" class="accordion-collapse collapse ${i===0?'show':''}" data-bs-parent="#tourItinerary"><div class="accordion-body text-muted">${item.content}</div></div>
                </div>`;
            });
            document.getElementById('btnBookNow').href = `booking.html?id=${tourId}`;
        }
    }

    // --- 4. BOOKING & LOGIC GIẢM GIÁ ---
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        const tourId = new URLSearchParams(window.location.search).get('id');
        const tour = toursData[tourId];

        if (tour) {
            document.getElementById('summaryName').innerText = tour.name;
            document.getElementById('summaryImg').src = tour.img;
            document.getElementById('summaryDuration').innerText = tour.duration;
            document.getElementById('summaryPricePerPax').innerText = new Intl.NumberFormat('vi-VN').format(tour.price) + "đ";

            // Elements hiển thị giá và giảm giá
            const elTotal = document.getElementById('summaryTotal');
            const elDiscount = document.querySelector('.text-success span') || document.getElementById('discountAmount'); 
            const elDiscountLabel = document.querySelector('.text-success small') || document.getElementById('discountLabel');

            // HÀM TÍNH TIỀN
            const calc = () => {
                const count = parseInt(document.getElementById('numPeople').value) || 1;
                let total = count * tour.price;
                let discountAmount = 0;
                let label = "ƯU ĐÃI HÈ";

                // LOGIC GIẢM GIÁ
                if (count >= 10) {
                    discountAmount = total * 0.2; // Giảm 20%
                    label = "GIẢM 20% (NHÓM > 10)";
                } else if (count >= 5) {
                    discountAmount = total * 0.1; // Giảm 10%
                    label = "GIẢM 10% (NHÓM > 5)";
                }

                if (discountAmount > 0) {
                    total = total - discountAmount;
                    if(elDiscount) elDiscount.innerText = `-${new Intl.NumberFormat('vi-VN').format(discountAmount)}đ`;
                    if(elDiscountLabel) elDiscountLabel.innerText = label;
                    if(elDiscount && elDiscount.parentElement.parentElement) 
                        elDiscount.parentElement.parentElement.classList.add("bg-success", "bg-opacity-10");
                } else {
                    if(elDiscount) elDiscount.innerText = "-0đ";
                    if(elDiscountLabel) elDiscountLabel.innerText = "ƯU ĐÃI HÈ";
                    if(elDiscount && elDiscount.parentElement.parentElement) 
                        elDiscount.parentElement.parentElement.classList.remove("bg-success", "bg-opacity-10");
                }

                elTotal.innerText = new Intl.NumberFormat('vi-VN').format(total) + "đ";
                const hiddenTotal = document.getElementById('hiddenTotalPrice');
                if(hiddenTotal) hiddenTotal.value = total;
                const hiddenName = document.getElementById('hiddenTourName');
                if(hiddenName) hiddenName.value = tour.name;
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
                    alert("Lỗi kết nối!");
                    btn.disabled = false; btn.innerText = "XÁC NHẬN ĐẶT TOUR";
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
        document.getElementById("chatBody").innerHTML += `<div class="message-user">${txt}</div>`;
        document.getElementById("chatBody").scrollTop = document.getElementById("chatBody").scrollHeight;
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
            reply = "GreenTrip đang giảm 10% cho nhóm trên 5 khách, 20% cho nhóm trên 10 khách ạ! 🎁";
            addBotMsg(reply);
            showOptions(["📞 Gặp tư vấn viên", "Đặt tour ngay"]);
        } else if(lower.includes("lịch trình")) {
            reply = "Bạn muốn xem lịch trình vùng nào?";
            addBotMsg(reply);
            showOptions(["Miền Bắc", "Miền Tây", "Biển Đảo"]);
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

    // --- 6. XỬ LÝ ĐĂNG KÝ ---
    const registerForm = document.getElementById("registerForm");
    if(registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector("button[type='submit']");
            btn.innerText = "Đang xử lý..."; btn.disabled = true;

            const name = document.getElementById("regName").value;
            const email = document.getElementById("regEmail").value;
            const pass = document.getElementById("regPass").value;
            const terms = document.getElementById("terms");

            if(!terms.checked) { 
                alert("Bạn chưa đồng ý điều khoản!"); 
                btn.innerText = "ĐĂNG KÝ NGAY"; btn.disabled = false;
                return; 
            }

            try {
                const q = query(collection(db, "users"), where("email", "==", email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    alert("Email này đã được đăng ký!");
                    btn.innerText = "ĐĂNG KÝ NGAY"; btn.disabled = false;
                    return;
                }

                await addDoc(collection(db, "users"), {
                    name: name, email: email, password: pass, 
                    role: "user", status: "active", createdAt: new Date().toLocaleString()
                });

                alert("✅ Đăng ký thành công! Vui lòng đăng nhập.");
                window.location.href = "login.html";
            } catch (error) {
                console.error(error);
                alert("Lỗi kết nối mạng!");
                btn.innerText = "ĐĂNG KÝ NGAY"; btn.disabled = false;
            }
        });
    }

    // --- 7. ĐĂNG NHẬP ---
    const loginForm = document.getElementById("loginForm");
    if(loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pass = document.querySelector('input[type="password"]').value;
            
            if (btoa(email) === "YWRtaW5AdHJhdmVsLmNvbQ==" && btoa(pass) === "YWRtaW4xMjM=") {
                localStorage.setItem("currentUser", JSON.stringify({name:"Admin", role:"admin"}));
                window.location.href = "admin/dashboard.html";
                return;
            }

            try {
                const q = query(collection(db, "users"), where("email", "==", email), where("password", "==", pass));
                const snap = await getDocs(q);
                
                if (!snap.empty) {
                    const user = snap.docs[0].data();
                    if(user.status === 'locked') { alert("Tài khoản bị khóa!"); return; }
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    window.location.href = "index.html";
                } else {
                    alert("Sai email hoặc mật khẩu!");
                }
            } catch(err) {
                alert("Lỗi đăng nhập!");
            }
        });
    }

    // --- 8. CHECK LOGIN MENU ---
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

    // --- 9. GÓP Ý ---
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
