/* =========================================
   MAIN JAVASCRIPT FILE - TRAVELSITE
   Đáp ứng yêu cầu chức năng:
   1. Đăng ký / Đăng nhập / Đăng xuất (Lưu trạng thái vào LocalStorage)
   2. Tìm kiếm & Lọc tour (Theo tên và Loại tour)
   3. Đặt tour (Validate form)
   4. Gửi liên hệ/Góp ý
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. BANNER SLIDE (Yêu cầu UI: Banner trình chiếu)
    // ==========================================
    const myCarouselElement = document.querySelector('#heroCarousel');
    if (myCarouselElement) {
        new bootstrap.Carousel(myCarouselElement, {
            interval: 3000,
            ride: 'carousel',
            wrap: true
        });
    }

    // ==========================================
    // 2. TÌM KIẾM & LỌC TOUR (Yêu cầu: Tìm kiếm + Lọc tour)
    // ==========================================
    const searchInput = document.getElementById("searchTourInput");
    const filterSelect = document.querySelector(".form-select"); // Dropdown loại tour bên sidebar
    const tourCards = document.querySelectorAll(".tour-card");

    function filterTours() {
        const searchText = searchInput ? searchInput.value.toLowerCase() : "";
        const filterType = filterSelect ? filterSelect.value : "Tất cả";

        tourCards.forEach(card => {
            // Lấy nội dung tên tour và loại tour (giả sử có badge hoặc text mô tả loại)
            const title = card.querySelector(".tour-title").innerText.toLowerCase();
            const cardBodyText = card.querySelector(".card-body").innerText; 
            
            // Logic kiểm tra
            const matchesSearch = title.includes(searchText);
            let matchesType = true;

            if (filterType !== "Tất cả") {
                // Kiểm tra xem trong card có chứa từ khóa của loại tour không (Ví dụ: "Biển", "Núi")
                // Lưu ý: Trong HTML thực tế nên thêm data-attribute để chính xác hơn
                if (!cardBodyText.includes(filterType)) {
                    matchesType = false;
                }
            }

            // Hiển thị hoặc ẩn
            if (matchesSearch && matchesType) {
                card.closest(".col-md-4").style.display = "block";
            } else {
                card.closest(".col-md-4").style.display = "none";
            }
        });
    }

    // Gán sự kiện nếu tồn tại element
    if (searchInput) searchInput.addEventListener("keyup", filterTours);
    if (filterSelect) filterSelect.addEventListener("change", filterTours);


    // ==========================================
    // 3. XỬ LÝ ĐẶT TOUR (Yêu cầu: Form thu thập thông tin)
    // ==========================================
    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // Validate dữ liệu
            const name = document.getElementById("customerName").value.trim();
            const phone = document.getElementById("customerPhone").value.trim();
            const email = document.getElementById("customerEmail").value.trim();

            if (name.length < 2) {
                alert("Họ tên không hợp lệ!"); return;
            }
            if (!/^[0-9]{10}$/.test(phone)) {
                alert("Số điện thoại phải là 10 số!"); return;
            }
            if (!email.includes("@")) {
                alert("Email không đúng định dạng!"); return;
            }

            // Giả lập gửi thành công
            alert(`Cảm ơn ${name}! Đơn đặt tour của bạn đang được xử lý.`);
            bookingForm.reset();
            // Điều hướng về trang chủ
            window.location.href = "index.html";
        });
    }

    // ==========================================
    // 4. ĐĂNG KÝ / ĐĂNG NHẬP / ĐĂNG XUẤT (Yêu cầu User)
    // ==========================================
    
    // --- Xử lý Đăng nhập ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            if (email && password) {
                // Giả lập logic Admin
                if (email === "admin@travel.com" && password === "admin123") {
                    localStorage.setItem("userRole", "admin");
                    localStorage.setItem("userName", "Admin");
                    alert("Đăng nhập Admin thành công!");
                    window.location.href = "admin/dashboard.html";
                } else {
                    // Giả lập User thường
                    localStorage.setItem("userRole", "user");
                    localStorage.setItem("userName", email.split('@')[0]); // Lấy tên trước @
                    alert("Đăng nhập thành công!");
                    window.location.href = "index.html";
                }
            } else {
                alert("Vui lòng điền đầy đủ thông tin!");
            }
        });
    }

    // --- Xử lý Đăng ký ---
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = registerForm.querySelector('input[type="text"]').value;
            // Giả lập đăng ký thành công -> Lưu luôn trạng thái đăng nhập
            localStorage.setItem("userRole", "user");
            localStorage.setItem("userName", name);
            
            alert("Đăng ký thành công! Chào mừng bạn gia nhập TravelSite.");
            window.location.href = "index.html";
        });
    }

    // --- Kiểm tra trạng thái đăng nhập (Hiển thị tên User/Logout trên Menu) ---
    function checkLoginStatus() {
        const userRole = localStorage.getItem("userRole");
        const userName = localStorage.getItem("userName");
        
        // Tìm vị trí nút Login/Register trên menu (dựa vào class ms-2 ở ul navbar)
        const authContainer = document.querySelector(".navbar-nav.ms-auto .ms-2");
        
        if (userRole && authContainer) {
            // Nếu đã đăng nhập, thay đổi nút Login thành tên User + Logout
            authContainer.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle btn-sm" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle"></i> Chào, ${userName}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        ${userRole === 'admin' ? '<li><a class="dropdown-item" href="admin/dashboard.html">Trang quản trị</a></li>' : ''}
                        <li><a class="dropdown-item" href="change-password.html">Đổi mật khẩu</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="btnLogout">Đăng xuất</a></li>
                    </ul>
                </div>
            `;
            
            // Gán sự kiện cho nút Đăng xuất vừa tạo
            document.getElementById("btnLogout").addEventListener("click", function(e) {
                e.preventDefault();
                if(confirm("Bạn muốn đăng xuất?")) {
                    localStorage.clear(); // Xóa dữ liệu lưu trữ
                    window.location.href = "index.html"; // Load lại trang
                }
            });
        }
    }
    // Chạy hàm kiểm tra ngay khi load trang
    checkLoginStatus();


    // ==========================================
    // 5. GỬI LIÊN HỆ / GÓP Ý (Yêu cầu User)
    // ==========================================
    const feedbackForm = document.getElementById("feedbackForm");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function (e) {
            e.preventDefault();
            alert("Góp ý của bạn đã được gửi đi. Cảm ơn bạn!");
            feedbackForm.reset();
        });
    }
    
    // ==========================================
    // 6. ĐỔI MẬT KHẨU
    // ==========================================
    const changePassForm = document.getElementById("changePassForm");
    if (changePassForm) {
        changePassForm.addEventListener("submit", function(e){
            e.preventDefault();
            const newPass = document.getElementById("newPass").value;
            const confirmPass = document.getElementById("confirmPass").value;
            
            if(newPass !== confirmPass) {
                alert("Mật khẩu xác nhận không khớp!");
            } else {
                alert("Đổi mật khẩu thành công!");
                changePassForm.reset();
            }
        });
    }
});
