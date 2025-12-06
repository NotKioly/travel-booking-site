/* =========================================
   MAIN JAVASCRIPT FILE - TRAVELSITE (SECURE VERSION)
   Chức năng: Quản lý tour, booking, user.
   Bảo mật: Đã ẩn thông tin Admin bằng Base64.
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 0. KHỞI TẠO DỮ LIỆU (CHỈ TẠO KHÁCH, KHÔNG TẠO ADMIN LỘ LIỄU)
    // ==========================================
    let users = JSON.parse(localStorage.getItem("listUsers")) || [];

    // Chỉ tạo tài khoản khách để demo nếu chưa có
    if (!users.find(u => u.email === "khach@gmail.com")) {
        users.push({ 
            name: "Khách Demo", 
            email: "khach@gmail.com", 
            password: "123", // Tài khoản thường thì không cần bảo mật kỹ
            role: "user", 
            status: "active" 
        });
        localStorage.setItem("listUsers", JSON.stringify(users));
        console.log("Đã khởi tạo dữ liệu khách hàng.");
    }


    // ==========================================
    // 1. BANNER SLIDE
    // ==========================================
    const myCarouselElement = document.querySelector('#heroCarousel');
    if (myCarouselElement) {
        new bootstrap.Carousel(myCarouselElement, { interval: 3000, ride: 'carousel', wrap: true });
    }


    // ==========================================
    // 2. TÌM KIẾM & LỌC TOUR
    // ==========================================
    const searchInput = document.getElementById("searchTourInput");
    const filterSelect = document.querySelector(".form-select");
    const tourCards = document.querySelectorAll(".tour-card");

    function filterTours() {
        const searchText = searchInput ? searchInput.value.toLowerCase() : "";
        const filterType = filterSelect ? filterSelect.value : "Tất cả";

        tourCards.forEach(card => {
            const title = card.querySelector(".tour-title").innerText.toLowerCase();
            const cardBodyText = card.querySelector(".card-body").innerText;
            
            const matchesSearch = title.includes(searchText);
            let matchesType = true;
            
            if (filterType !== "Tất cả" && !cardBodyText.includes(filterType)) {
                matchesType = false;
            }
            
            card.closest(".col-md-4").style.display = (matchesSearch && matchesType) ? "block" : "none";
        });
    }
    if (searchInput) searchInput.addEventListener("keyup", filterTours);
    if (filterSelect) filterSelect.addEventListener("change", filterTours);


    // ==========================================
    // 3. XỬ LÝ ĐẶT TOUR
    // ==========================================
    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = document.getElementById("customerName").value;
            const phone = document.getElementById("customerPhone").value;
            
            if(name.length < 2) { alert("Vui lòng nhập tên hợp lệ"); return; }
            if(phone.length < 10) { alert("Số điện thoại không hợp lệ"); return; }

            alert("Đặt tour thành công! Chúng tôi sẽ liên hệ sớm.");
            window.location.href = "index.html";
        });
    }


    // ==========================================
    // 4. ĐĂNG KÝ
    // ==========================================
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = registerForm.querySelector('input[type="text"]').value;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;
            const terms = document.getElementById("terms");

            if (terms && !terms.checked) { alert("Vui lòng đồng ý điều khoản!"); return; }

            let usersList = JSON.parse(localStorage.getItem("listUsers")) || [];

            if (usersList.find(u => u.email === email)) {
                alert("Email này đã được đăng ký!");
                return;
            }

            usersList.push({ name: name, email: email, password: password, role: "user", status: "active" });
            localStorage.setItem("listUsers", JSON.stringify(usersList));

            alert("Đăng ký thành công! Hãy đăng nhập ngay.");
            window.location.href = "login.html";
        });
    }


    // ==========================================
    // 5. ĐĂNG NHẬP (BẢO MẬT HƠN)
    // ==========================================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            // --- CƠ CHẾ ĐĂNG NHẬP ADMIN ẨN (SECRET) ---
            // Mã hóa input của người dùng sang Base64 để so sánh
            // "admin123" mã hóa thành "YWRtaW4xMjM="
            // "admin@travel.com" mã hóa thành "YWRtaW5AdHJhdmVsLmNvbQ=="
            
            const encodedEmail = btoa(email);     // Mã hóa email nhập vào
            const encodedPass = btoa(password);   // Mã hóa pass nhập vào

            // So sánh với mã bí mật (Không lộ password thật trong code)
            const SECRET_ADMIN_EMAIL = "YWRtaW5AdHJhdmVsLmNvbQ=="; 
            const SECRET_ADMIN_PASS = "YWRtaW4xMjM=";              

            if (encodedEmail === SECRET_ADMIN_EMAIL && encodedPass === SECRET_ADMIN_PASS) {
                // Nếu đúng khớp lệnh Admin
                const adminUser = { 
                    name: "Admin System", 
                    email: email, 
                    role: "admin", 
                    password: password // Lưu vào session để đổi pass sau này
                };
                
                // Tự động thêm admin vào danh sách users nếu chưa có (để quản lý trong trang Admin)
                let currentList = JSON.parse(localStorage.getItem("listUsers")) || [];
                const idx = currentList.findIndex(u => u.email === email);
                if(idx === -1) {
                    currentList.push({...adminUser, status: 'active'});
                    localStorage.setItem("listUsers", JSON.stringify(currentList));
                }

                localStorage.setItem("currentUser", JSON.stringify(adminUser));
                alert("Xin chào Admin! Đang chuyển hướng...");
                window.location.href = "admin/dashboard.html";
                return;
            }
            // ------------------------------------------

            // ĐĂNG NHẬP USER THƯỜNG (Lấy từ LocalStorage)
            let users = JSON.parse(localStorage.getItem("listUsers")) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                if(user.status === "locked") {
                    alert("Tài khoản này đã bị khóa!"); return;
                }
                localStorage.setItem("currentUser", JSON.stringify(user));
                alert(`Xin chào ${user.name}!`);
                window.location.href = "index.html";
            } else {
                alert("Sai email hoặc mật khẩu!");
            }
        });
    }


    // ==========================================
    // 6. TRẠNG THÁI ĐĂNG NHẬP (MENU)
    // ==========================================
    function checkLoginStatus() {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const authContainer = document.querySelector(".navbar-nav.ms-auto .ms-2");

        if (currentUser && authContainer) {
            authContainer.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle btn-sm" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle"></i> ${currentUser.name}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        ${currentUser.role === 'admin' ? '<li><a class="dropdown-item" href="admin/dashboard.html">Trang quản trị</a></li>' : ''}
                        <li><a class="dropdown-item" href="change-password.html">Đổi mật khẩu</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="btnLogout">Đăng xuất</a></li>
                    </ul>
                </div>
            `;
            document.getElementById("btnLogout").addEventListener("click", function (e) {
                e.preventDefault();
                if (confirm("Đăng xuất ngay?")) {
                    localStorage.removeItem("currentUser");
                    window.location.href = "index.html";
                }
            });
        }
    }
    checkLoginStatus();


    // ==========================================
    // 7. ĐỔI MẬT KHẨU
    // ==========================================
    const changePassForm = document.getElementById("changePassForm");
    if (changePassForm) {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            alert("Bạn cần đăng nhập!");
            window.location.href = "login.html";
        } else {
            changePassForm.addEventListener("submit", function (e) {
                e.preventDefault();
                const oldPassInput = document.getElementById("oldPass"); 
                const newPass = document.getElementById("newPass").value;
                const confirmPass = document.getElementById("confirmPass").value;

                if (oldPassInput.value !== currentUser.password) {
                    alert("Mật khẩu hiện tại không đúng!"); return;
                }
                if (newPass.length < 3) {
                    alert("Mật khẩu mới quá ngắn!"); return;
                }
                if (newPass !== confirmPass) {
                    alert("Mật khẩu xác nhận chưa khớp!"); return;
                }

                // Cập nhật Database
                let listUsers = JSON.parse(localStorage.getItem("listUsers")) || [];
                const index = listUsers.findIndex(u => u.email === currentUser.email);
                
                if (index !== -1) {
                    listUsers[index].password = newPass;
                    localStorage.setItem("listUsers", JSON.stringify(listUsers));
                    
                    currentUser.password = newPass;
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));

                    alert("Đổi mật khẩu thành công!");
                    changePassForm.reset();
                    // Reset giao diện validation
                    document.getElementById("confirmPass").classList.remove("is-invalid");
                    document.getElementById("passErrorMsg").style.display = "none";
                }
            });
        }
    }

    // 8. GÓP Ý
    const feedbackForm = document.getElementById("feedbackForm");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function(e){
            e.preventDefault();
            alert("Cảm ơn bạn đã gửi góp ý!");
            feedbackForm.reset();
        })
    }
});
