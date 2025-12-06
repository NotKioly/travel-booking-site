/* =========================================
   MAIN JAVASCRIPT FILE - TRAVELSITE (FIX LOGIN VERSION)
   Chức năng: Tự động sửa lỗi đăng nhập Admin, Quản lý tour, booking
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 0. KHỞI TẠO DỮ LIỆU & SỬA LỖI ĐĂNG NHẬP
    // ==========================================
    // Lấy danh sách user hiện tại ra (hoặc tạo mảng rỗng nếu chưa có)
    let users = JSON.parse(localStorage.getItem("listUsers")) || [];

    // Tìm xem đã có tài khoản Admin chưa
    const adminIndex = users.findIndex(u => u.email === "admin@travel.com");

    if (adminIndex !== -1) {
        // NẾU ĐÃ CÓ: Cập nhật lại mật khẩu chuẩn để bạn đăng nhập được
        users[adminIndex].password = "admin123";
        users[adminIndex].role = "admin"; 
        console.log("Đã reset mật khẩu Admin về: admin123");
    } else {
        // NẾU CHƯA CÓ: Tạo mới luôn
        users.push({ 
            name: "Admin System", 
            email: "admin@travel.com", 
            password: "admin123", 
            role: "admin",
            status: "active"
        });
        console.log("Đã tạo tài khoản Admin mới.");
    }

    // Đảm bảo có user khách để test
    if (!users.find(u => u.email === "khach@gmail.com")) {
        users.push({ name: "Khách Demo", email: "khach@gmail.com", password: "123", role: "user", status: "active" });
    }

    // Lưu ngược lại vào bộ nhớ (Ghi đè dữ liệu cũ)
    localStorage.setItem("listUsers", JSON.stringify(users));


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
            
            if (matchesSearch && matchesType) {
                card.closest(".col-md-4").style.display = "block";
            } else {
                card.closest(".col-md-4").style.display = "none";
            }
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
    // 4. ĐĂNG KÝ (CHECK TỒN TẠI & LƯU MỚI)
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

            // Kiểm tra trùng email
            if (usersList.find(u => u.email === email)) {
                alert("Email này đã được đăng ký!");
                return;
            }

            // Lưu user mới
            usersList.push({ name: name, email: email, password: password, role: "user", status: "active" });
            localStorage.setItem("listUsers", JSON.stringify(usersList));

            alert("Đăng ký thành công! Hãy đăng nhập ngay.");
            window.location.href = "login.html";
        });
    }


    // ==========================================
    // 5. ĐĂNG NHẬP (QUAN TRỌNG NHẤT)
    // ==========================================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            // Lấy danh sách mới nhất từ bộ nhớ
            let currentUsersList = JSON.parse(localStorage.getItem("listUsers")) || [];

            // Tìm user
            const user = currentUsersList.find(u => u.email === email && u.password === password);

            if (user) {
                // Kiểm tra xem có bị khóa không
                if(user.status === "locked") {
                    alert("Tài khoản này đã bị khóa!");
                    return;
                }

                // Đăng nhập thành công
                localStorage.setItem("currentUser", JSON.stringify(user));
                alert(`Xin chào ${user.name}!`);
                
                if (user.role === "admin") {
                    window.location.href = "admin/dashboard.html";
                } else {
                    window.location.href = "index.html";
                }
            } else {
                alert("Sai email hoặc mật khẩu! (Hãy thử admin@travel.com / admin123)");
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
                
                // Lưu ý: Cần thêm id="oldPass" vào input mật khẩu cũ ở file HTML
                const oldPassInput = document.getElementById("oldPass"); 
                const newPass = document.getElementById("newPass").value;
                const confirmPass = document.getElementById("confirmPass").value;

                // Dự phòng nếu bạn chưa sửa HTML
                const oldPassValue = oldPassInput ? oldPassInput.value : document.querySelector("input[type='password']").value;

                if (oldPassValue !== currentUser.password) {
                    alert("Mật khẩu hiện tại không đúng!");
                    return;
                }

                if (newPass.length < 3) {
                    alert("Mật khẩu quá ngắn!"); return;
                }
                if (newPass !== confirmPass) {
                    alert("Mật khẩu xác nhận không khớp!"); return;
                }

                // Cập nhật dữ liệu
                let listUsers = JSON.parse(localStorage.getItem("listUsers")) || [];
                const index = listUsers.findIndex(u => u.email === currentUser.email);
                
                if (index !== -1) {
                    listUsers[index].password = newPass;
                    localStorage.setItem("listUsers", JSON.stringify(listUsers));
                    
                    currentUser.password = newPass;
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));

                    alert("Đổi mật khẩu thành công!");
                    changePassForm.reset();
                }
            });
        }
    }

    // ==========================================
    // 8. GÓP Ý
    // ==========================================
    const feedbackForm = document.getElementById("feedbackForm");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function(e){
            e.preventDefault();
            alert("Cảm ơn bạn đã gửi góp ý!");
            feedbackForm.reset();
        })
    }
});
