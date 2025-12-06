/* =========================================
   MAIN JAVASCRIPT FILE - TRAVELSITE (FINAL VERSION)
   Chức năng: Quản lý tài khoản, mật khẩu, đặt tour, tìm kiếm bằng LocalStorage
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 0. KHỞI TẠO DỮ LIỆU GIẢ (DATABASE)
    // ==========================================
    // Chỉ tạo nếu chưa có dữ liệu trong bộ nhớ trình duyệt
    if (!localStorage.getItem("listUsers")) {
        const initialUsers = [
            // TÀI KHOẢN ADMIN MẶC ĐỊNH
            { name: "Admin System", email: "admin@travel.com", password: "admin123", role: "admin" },
            // Tài khoản khách mẫu
            { name: "Khách Demo", email: "khach@gmail.com", password: "123", role: "user" }
        ];
        localStorage.setItem("listUsers", JSON.stringify(initialUsers));
        console.log("Đã khởi tạo dữ liệu người dùng mẫu.");
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
            
            // Nếu chọn loại tour cụ thể (không phải Tất cả) thì kiểm tra text
            if (filterType !== "Tất cả" && !cardBodyText.includes(filterType)) {
                matchesType = false;
            }
            
            // Hiển thị hoặc ẩn
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
            // Validate đơn giản
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
            
            // Kiểm tra checkbox điều khoản
            const terms = document.getElementById("terms");
            if (terms && !terms.checked) { alert("Vui lòng đồng ý điều khoản!"); return; }

            // Lấy danh sách user từ LocalStorage
            let users = JSON.parse(localStorage.getItem("listUsers")) || [];

            // KIỂM TRA TÀI KHOẢN TỒN TẠI
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                alert("Email này đã được đăng ký! Vui lòng dùng email khác.");
                return;
            }

            // Lưu user mới
            const newUser = { name: name, email: email, password: password, role: "user" };
            users.push(newUser);
            localStorage.setItem("listUsers", JSON.stringify(users));

            alert("Đăng ký thành công! Hãy đăng nhập ngay.");
            window.location.href = "login.html";
        });
    }

    // ==========================================
    // 5. ĐĂNG NHẬP (CHECK ĐÚNG SAI TỪ DB)
    // ==========================================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            // Lấy danh sách user để đối chiếu
            let users = JSON.parse(localStorage.getItem("listUsers")) || [];

            // Tìm user khớp email và pass
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Đăng nhập thành công -> Lưu session
                localStorage.setItem("currentUser", JSON.stringify(user));
                
                alert(`Xin chào ${user.name}!`);
                
                // Điều hướng dựa trên quyền (Role)
                if (user.role === "admin") {
                    window.location.href = "admin/dashboard.html";
                } else {
                    window.location.href = "index.html";
                }
            } else {
                alert("Sai email hoặc mật khẩu! Vui lòng kiểm tra lại.");
            }
        });
    }

    // ==========================================
    // 6. TRẠNG THÁI ĐĂNG NHẬP & ĐĂNG XUẤT (MENU)
    // ==========================================
    function checkLoginStatus() {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        // Tìm vị trí nút Login trên menu
        const authContainer = document.querySelector(".navbar-nav.ms-auto .ms-2");

        if (currentUser && authContainer) {
            // Thay nút Login bằng Dropdown User
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

            // Xử lý sự kiện Đăng xuất
            document.getElementById("btnLogout").addEventListener("click", function (e) {
                e.preventDefault();
                if (confirm("Đăng xuất ngay?")) {
                    localStorage.removeItem("currentUser");
                    window.location.href = "index.html";
                }
            });
        }
    }
    // Chạy ngay khi load trang
    checkLoginStatus();

    // ==========================================
    // 7. ĐỔI MẬT KHẨU
    // ==========================================
    const changePassForm = document.getElementById("changePassForm");
    if (changePassForm) {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        
        if (!currentUser) {
            alert("Bạn cần đăng nhập để thực hiện chức năng này!");
            window.location.href = "login.html";
        } else {
            changePassForm.addEventListener("submit", function (e) {
                e.preventDefault();
                
                // Lấy giá trị input (Đảm bảo input HTML có đúng ID)
                const oldPassInput = document.getElementById("oldPass"); 
                const newPass = document.getElementById("newPass").value;
                const confirmPass = document.getElementById("confirmPass").value;

                if(!oldPassInput) { console.error("Thiếu id='oldPass' trong HTML"); return; }

                // 1. Check mật khẩu cũ
                if (oldPassInput.value !== currentUser.password) {
                    alert("Mật khẩu hiện tại không đúng!");
                    return;
                }

                // 2. Check mật khẩu mới
                if (newPass.length < 3) {
                    alert("Mật khẩu mới quá ngắn!"); return;
                }
                if (newPass !== confirmPass) {
                    alert("Mật khẩu xác nhận không khớp!"); return;
                }

                // 3. Cập nhật dữ liệu
                let users = JSON.parse(localStorage.getItem("listUsers")) || [];
                const index = users.findIndex(u => u.email === currentUser.email);
                
                if (index !== -1) {
                    users[index].password = newPass; // Cập nhật trong list tổng
                    localStorage.setItem("listUsers", JSON.stringify(users));
                    
                    currentUser.password = newPass; // Cập nhật session hiện tại
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));

                    alert("Đổi mật khẩu thành công!");
                    changePassForm.reset();
                }
            });
        }
    }

    // ==========================================
    // 8. GÓP Ý / LIÊN HỆ
    // ==========================================
    const feedbackForm = document.getElementById("feedbackForm");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function(e){
            e.preventDefault();
            alert("Cảm ơn bạn đã gửi góp ý!");
            feedbackForm.reset();
        })
    }
});edbackForm.addEventListener("submit", function(e){
            e.preventDefault();
            alert("Đã gửi góp ý!");
            feedbackForm.reset();
        })
    }
});
