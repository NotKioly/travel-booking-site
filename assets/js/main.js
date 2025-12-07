/* =========================================
   MAIN.JS - GREENTRIP (FULL VERSION)
   Chức năng: Dữ liệu Tour, Logic Đăng nhập, Chatbot, Booking
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // --- 1. CƠ SỞ DỮ LIỆU TOUR (9 TOUR) ---
    // Đây là "kho dữ liệu" dùng chung cho cả web
    const toursData = {
        "T001": { 
            name: "Đà Lạt - Thành Phố Ngàn Hoa", 
            price: 1500000, 
            duration: "3 Ngày 2 Đêm", 
            location: "Lâm Đồng",
            type: "Núi",
            img: "assets/img/tour1.jpg", 
            highlights: ["Săn mây Cầu Đất", "Quảng trường Lâm Viên", "Vườn hoa Cẩm Tú Cầu", "Thác Datanla"],
            itinerary: [
                { day: "Ngày 1", title: "TP.HCM - Đà Lạt", content: "Đón khách, di chuyển lên Đà Lạt. Tham quan Quảng trường Lâm Viên, Hồ Xuân Hương." },
                { day: "Ngày 2", title: "Săn Mây - Đồi Chè", content: "Sáng sớm đi săn mây Cầu Đất. Chiều tham quan vườn hoa, Đường hầm điêu khắc." },
                { day: "Ngày 3", title: "Thác Datanla - TP.HCM", content: "Trải nghiệm máng trượt thác Datanla. Mua sắm đặc sản. Khởi hành về TP.HCM." }
            ]
        },
        "T002": { 
            name: "Nha Trang - Thiên Đường Biển", 
            price: 2300000, 
            duration: "3 Ngày 2 Đêm", 
            location: "Khánh Hòa",
            type: "Biển",
            img: "assets/img/tour2.jpg", 
            highlights: ["Vinwonders", "Lặn ngắm san hô Hòn Mun", "Tắm bùn khoáng nóng", "Tiệc Bar nổi"],
            itinerary: [
                { day: "Ngày 1", title: "Đón Sân Bay - Vinwonders", content: "Xe đón khách. Tham quan Vinwonders, xem biểu diễn cá heo." },
                { day: "Ngày 2", title: "Du Ngoạn 3 Đảo", content: "Cano đi Hòn Mun, Hòn Một. Tắm biển, lặn ngắm san hô. Chiều tắm bùn I-Resort." },
                { day: "Ngày 3", title: "City Tour", content: "Tham quan Tháp Bà Ponagar, Nhà thờ Núi. Mua sắm Chợ Đầm. Ra sân bay." }
            ]
        },
        "T003": { 
            name: "Phú Quốc - Đảo Ngọc", 
            price: 3800000, 
            duration: "4 Ngày 3 Đêm", 
            location: "Kiên Giang",
            type: "Biển",
            img: "assets/img/tour3.jpg", 
            highlights: ["Cáp treo Hòn Thơm", "Grand World", "Bãi Sao", "Sunset Sanato"],
            itinerary: [
                { day: "Ngày 1", title: "Đón Khách - Grand World", content: "Đón sân bay. Tối tham quan Thành phố không ngủ Grand World." },
                { day: "Ngày 2", title: "Câu Cá - Lặn Ngắm San Hô", content: "Tham quan Nam Đảo, Bãi Sao. Lên tàu câu cá, lặn ngắm san hô." },
                { day: "Ngày 3", title: "Cáp Treo Hòn Thơm", content: "Trải nghiệm cáp treo vượt biển dài nhất thế giới. Vui chơi tại Sun World." },
                { day: "Ngày 4", title: "Tạm Biệt Phú Quốc", content: "Tự do tắm biển, mua sắm ngọc trai. Tiễn sân bay." }
            ]
        },
        "T004": { 
            name: "Hạ Long - Kỳ Quan", 
            price: 2500000, 
            duration: "2 Ngày 1 Đêm", 
            location: "Quảng Ninh",
            type: "Biển",
            img: "assets/img/tour4.jpg", 
            highlights: ["Du thuyền 5 sao", "Hang Sửng Sốt", "Đảo Ti Tốp", "Chèo Kayak"],
            itinerary: [
                { day: "Ngày 1", title: "Hà Nội - Vịnh Hạ Long", content: "Di chuyển đến cảng Tuần Châu. Lên du thuyền, ăn trưa. Tham quan Hang Sửng Sốt." },
                { day: "Ngày 2", title: "Đảo Ti Tốp - Hà Nội", content: "Tắm biển hoặc leo núi tại đảo Ti Tốp. Chèo Kayak. Trở về Hà Nội." }
            ]
        },
        "T005": { 
            name: "Sapa - Fansipan Legend", 
            price: 1800000, 
            duration: "3 Ngày 2 Đêm", 
            location: "Lào Cai",
            type: "Núi",
            img: "assets/img/tour5.jpg", 
            highlights: ["Đỉnh Fansipan", "Bản Cát Cát", "Nhà thờ Đá", "Thung lũng Mường Hoa"],
            itinerary: [
                { day: "Ngày 1", title: "Hà Nội - Sapa", content: "Xe giường nằm đi Sapa. Chiều leo núi Hàm Rồng ngắm toàn cảnh." },
                { day: "Ngày 2", title: "Chinh Phục Fansipan", content: "Đi cáp treo chinh phục nóc nhà Đông Dương. Săn mây." },
                { day: "Ngày 3", title: "Bản Cát Cát", content: "Tham quan bản làng người H'Mông. Tìm hiểu văn hóa bản địa. Về Hà Nội." }
            ]
        },
        "T006": { 
            name: "Nhật Bản - Cung Đường Vàng", 
            price: 25000000, 
            duration: "5 Ngày 4 Đêm", 
            location: "Nhật Bản",
            type: "Quốc tế",
            img: "assets/img/tour6.jpg", 
            highlights: ["Núi Phú Sĩ", "Chùa Vàng", "Phố cổ Kyoto", "Shopping Ginza"],
            itinerary: [
                { day: "Ngày 1", title: "Bay đến Tokyo", content: "Đáp sân bay Narita. Tham quan Chùa Asakusa Kannon, tháp Tokyo Skytree." },
                { day: "Ngày 2", title: "Tokyo - Núi Phú Sĩ", content: "Di chuyển đi Núi Phú Sĩ. Tham quan làng cổ Oshino Hakkai. Tắm Onsen." },
                { day: "Ngày 3", title: "Nagoya - Kyoto", content: "Đi tàu Shinkansen. Tham quan Chùa Vàng, Rừng tre Arashiyama." },
                { day: "Ngày 4", title: "Osaka", content: "Tham quan Lâu đài Osaka. Mua sắm tại Shinsaibashi." },
                { day: "Ngày 5", title: "Về Việt Nam", content: "Ra sân bay Kansai. Kết thúc chuyến đi." }
            ]
        },
        "T007": { 
            name: "Thái Lan - Bangkok Pattaya", 
            price: 6500000, 
            duration: "4 Ngày 3 Đêm", 
            location: "Thái Lan",
            type: "Quốc tế",
            img: "assets/img/tour7.jpg", 
            highlights: ["Đảo Coral", "Chùa Phật Vàng", "Show Alcazar", "Buffet 86 tầng"],
            itinerary: [
                { day: "Ngày 1", title: "TP.HCM - Bangkok", content: "Bay đến Bangkok. Di chuyển đi Pattaya. Tham quan Chợ Nổi." },
                { day: "Ngày 2", title: "Đảo Coral", content: "Cano đi đảo Coral tắm biển. Chiều trải nghiệm Massage Thái." },
                { day: "Ngày 3", title: "Pattaya - Bangkok", content: "Tham quan Trân Bảo Phật Sơn. Ăn Buffet tại Baiyoke Sky." },
                { day: "Ngày 4", title: "Chùa Phật Vàng", content: "Viếng Chùa Phật Vàng, dạo thuyền sông Chaophraya. Ra sân bay." }
            ]
        },
        "T008": { 
            name: "Miền Tây Sông Nước", 
            price: 1200000, 
            duration: "2 Ngày 1 Đêm", 
            location: "Cần Thơ",
            type: "Nông thôn",
            img: "assets/img/tour8.jpg", 
            highlights: ["Chợ nổi Cái Răng", "Vườn trái cây", "Lò kẹo dừa", "Đờn ca tài tử"],
            itinerary: [
                { day: "Ngày 1", title: "TP.HCM - Mỹ Tho - Bến Tre", content: "Tham quan Cồn Thới Sơn, đi xuồng ba lá, thăm lò kẹo dừa. Nghe đờn ca tài tử." },
                { day: "Ngày 2", title: "Cần Thơ - Chợ Nổi", content: "5h sáng đi chợ nổi Cái Răng. Tham quan vườn trái cây. Khởi hành về TP.HCM." }
            ]
        },
        "T009": { 
            name: "Hà Nội - 36 Phố Phường", 
            price: 800000, 
            duration: "1 Ngày", 
            location: "Hà Nội",
            type: "Thành thị",
            img: "assets/img/tour9.jpg", 
            highlights: ["Lăng Bác", "Hồ Gươm", "Văn Miếu", "Phố cổ", "Cafe Trứng"],
            itinerary: [
                { day: "Sáng", title: "Lăng Bác - Văn Miếu", content: "Viếng Lăng Bác, Chùa Một Cột, Văn Miếu Quốc Tử Giám." },
                { day: "Chiều", title: "Hồ Gươm - Phố Cổ", content: "Dạo quanh Hồ Gươm, Đền Ngọc Sơn. Khám phá ẩm thực phố cổ và thưởng thức Cafe Trứng." }
            ]
        }
    };

    // --- 2. XỬ LÝ TRANG CHI TIẾT (TOUR-DETAIL.HTML) ---
    // Tự động điền thông tin dựa trên ID trên thanh địa chỉ
    const detailTitle = document.getElementById('detailTitle');
    if (detailTitle) {
        const params = new URLSearchParams(window.location.search);
        const tourId = params.get('id'); // Lấy ID từ URL (vd: ?id=T008)
        const tour = toursData[tourId];

        if (tour) {
            // Điền thông tin cơ bản
            document.getElementById('breadcrumbName').innerText = tour.name;
            detailTitle.innerText = tour.name;
            document.getElementById('detailLocation').innerText = tour.location;
            document.getElementById('detailDuration').innerText = tour.duration;
            document.getElementById('detailPrice').innerText = new Intl.NumberFormat('vi-VN').format(tour.price) + "đ";
            document.getElementById('detailImage').src = tour.img;

            // Điền Điểm nổi bật
            const highlightContainer = document.getElementById('detailHighlights');
            tour.highlights.forEach(hl => {
                highlightContainer.innerHTML += `<div class="col-md-6 d-flex align-items-center mb-2"><i class="fas fa-check-circle text-success me-2"></i> ${hl}</div>`;
            });

            // Điền Lịch trình
            const itineraryContainer = document.getElementById('tourItinerary');
            tour.itinerary.forEach((item, index) => {
                const isShow = index === 0 ? "show" : "";
                const isCollapsed = index === 0 ? "" : "collapsed";
                itineraryContainer.innerHTML += `
                    <div class="accordion-item border-0 shadow-sm mb-3 rounded overflow-hidden">
                        <h2 class="accordion-header">
                            <button class="accordion-button ${isCollapsed} fw-bold bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#day${index}">
                                <span class="badge bg-primary me-3">${item.day}</span> ${item.title}
                            </button>
                        </h2>
                        <div id="day${index}" class="accordion-collapse collapse ${isShow}" data-bs-parent="#tourItinerary">
                            <div class="accordion-body text-muted">${item.content}</div>
                        </div>
                    </div>`;
            });

            // Cập nhật nút Đặt tour để chuyển đúng ID sang trang Booking
            const btnBook = document.getElementById('btnBookNow');
            if(btnBook) btnBook.href = `booking.html?id=${tourId}`;

        } else {
            detailTitle.innerText = "Không tìm thấy thông tin tour!";
        }
    }

    // --- 3. XỬ LÝ TRANG ĐẶT TOUR (BOOKING.HTML) ---
    // Tự động tính tiền
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        const params = new URLSearchParams(window.location.search);
        const tourId = params.get('id');
        const tour = toursData[tourId];

        if (tour) {
            document.getElementById('summaryName').innerText = tour.name;
            document.getElementById('summaryImg').src = tour.img;
            document.getElementById('summaryDuration').innerText = tour.duration;
            document.getElementById('summaryPricePerPax').innerText = new Intl.NumberFormat('vi-VN').format(tour.price) + "đ";

            const calcTotal = () => {
                const count = parseInt(document.getElementById('numPeople').value) || 1;
                const total = count * tour.price;
                document.getElementById('summaryTotal').innerText = new Intl.NumberFormat('vi-VN').format(total) + "đ";
            };
            
            document.getElementById('numPeople').addEventListener('input', calcTotal);
            calcTotal(); // Tính ngay lần đầu

            // Xử lý Gửi đơn (Lưu vào LocalStorage giả lập Server)
            bookingForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const booking = {
                    id: "BK" + Date.now(),
                    tourName: tour.name,
                    customer: document.getElementById('customerName').value,
                    phone: document.getElementById('customerPhone').value,
                    people: document.getElementById('numPeople').value,
                    total: document.getElementById('summaryTotal').innerText,
                    status: 'pending',
                    createdAt: new Date().toLocaleString()
                };

                // Lưu vào danh sách đơn hàng
                let bookings = JSON.parse(localStorage.getItem('listBookings')) || [];
                bookings.push(booking);
                localStorage.setItem('listBookings', JSON.stringify(bookings));

                alert("✅ Đặt tour thành công! Chúng tôi sẽ liên hệ lại ngay.");
                window.location.href = "index.html";
            });
        }
    }

    // --- 4. TÌM KIẾM & BỘ LỌC (TOUR.HTML) ---
    const searchInput = document.getElementById("searchTourInput");
    const filterSelect = document.getElementById("filterType");
    
    // Hàm lọc dùng chung
    window.applyFilter = function() {
        const searchText = searchInput ? searchInput.value.toLowerCase() : "";
        const filterType = filterSelect ? filterSelect.value : "Tất cả";
        const cards = document.querySelectorAll(".tour-card");

        cards.forEach(card => {
            const title = card.querySelector(".tour-title").innerText.toLowerCase();
            // Lấy loại tour từ badge (ví dụ: Núi, Biển...)
            const badge = card.querySelector(".tour-badge").innerText; 
            // Mapping loại hiển thị với giá trị select
            let typeMap = {
                "Biển": "Biển", "Núi": "Núi", "Quốc tế": "Quốc tế", 
                "Nông thôn": "Nông thôn", "Thành thị": "Thành thị", "Cao cấp": "Biển" // Ví dụ map thêm
            };
            
            const matchSearch = title.includes(searchText);
            const matchType = filterType === "Tất cả" || (typeMap[badge] === filterType) || (badge === filterType);

            if (matchSearch && matchType) {
                card.closest(".col-md-6").style.display = "block";
            } else {
                card.closest(".col-md-6").style.display = "none";
            }
        });
    }
    // Gán sự kiện enter cho ô tìm kiếm
    if(searchInput) searchInput.addEventListener("keyup", applyFilter);


    // --- 5. ĐĂNG NHẬP (BẢO MẬT BASE64) ---
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
                const admin = { name: "Admin GreenTrip", role: "admin" };
                localStorage.setItem("currentUser", JSON.stringify(admin));
                alert("Xin chào Admin!");
                window.location.href = "admin/dashboard.html";
            } else {
                // Check user thường
                let users = JSON.parse(localStorage.getItem("listUsers")) || [];
                const user = users.find(u => u.email === email && u.password === pass);
                if (user) {
                    if(user.status === 'locked') { alert("Tài khoản bị khóa!"); return; }
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    alert(`Chào mừng ${user.name}!`);
                    window.location.href = "index.html";
                } else {
                    alert("Sai email hoặc mật khẩu!");
                }
            }
        });
    }

    // --- 6. CHECK TRẠNG THÁI ĐĂNG NHẬP (MENU) ---
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const authNav = document.querySelector(".navbar-nav .ms-2");
    if (currentUser && authNav) {
        authNav.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle btn-sm" data-bs-toggle="dropdown">
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

    // --- 7. CHATBOT TỰ ĐỘNG ---
    window.toggleChat = function() {
        const widget = document.getElementById("chatWidget");
        widget.style.display = (widget.style.display === "none" || widget.style.display === "") ? "block" : "none";
        if(widget.style.display === "block" && document.getElementById("chatBody").children.length === 0) {
            addBotMsg("Xin chào! 👋 Tôi là trợ lý ảo GreenTrip. Bạn cần tư vấn tour nào?");
        }
    }

    window.handleChat = function(e) { if(e.key === "Enter") sendUserMessage(); }

    window.sendUserMessage = function() {
        const input = document.getElementById("chatInput");
        const txt = input.value.trim();
        if(!txt) return;
        
        // Hiện tin nhắn khách
        const body = document.getElementById("chatBody");
        body.innerHTML += `<div class="message-user">${txt}</div>`;
        input.value = "";
        body.scrollTop = body.scrollHeight;

        // Bot trả lời sau 1s
        setTimeout(() => {
            let reply = "Cảm ơn bạn. Để được tư vấn chi tiết và nhận ưu đãi, vui lòng gọi Hotline miễn phí bên dưới nhé!";
            if(txt.toLowerCase().includes("giá")) reply = "Giá tour đang được ưu đãi giảm 10% nếu đặt hôm nay ạ! 💰";
            else if(txt.toLowerCase().includes("chào")) reply = "Chào bạn! Mình có thể giúp gì cho bạn?";
            
            addBotMsg(reply);
            // Luôn chốt bằng số điện thoại
            setTimeout(() => {
                addBotMsg(`📞 <strong>HOTLINE MIỄN PHÍ:</strong><br><a href="tel:0347348147" style="color:#00A651;font-weight:bold;text-decoration:none">0347.348.147</a>`);
            }, 1200);
        }, 800);
    }

    function addBotMsg(html) {
        const body = document.getElementById("chatBody");
        body.innerHTML += `<div class="message-bot">${html}</div>`;
        body.scrollTop = body.scrollHeight;
    }
});
