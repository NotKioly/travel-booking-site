/* =========================================
   MAIN JAVASCRIPT FILE - TRAVELSITE (NÂNG CẤP)
   Chức năng: Quản lý tài khoản, mật khẩu thực tế bằng LocalStorage
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 0. KHỞI TẠO DỮ LIỆU GIẢ (DATABASE)
    // ==========================================
    // Kiểm tra xem đã có danh sách user chưa, nếu chưa thì tạo user Admin mặc định
    if (!localStorage.getItem("listUsers")) {
        const initialUsers = [
            { name: "Admin System", email: "admin@travel.com", password: "admin", role: "admin" },
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
            // (Giữ nguyên logic validate form của bạn ở đây)
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
    // 5. ĐĂNG NHẬP (CHECK ĐÚNG SAI)
    // ==========================================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            let users = JSON.parse(localStorage.getItem("listUsers")) || [];

            // Tìm user trong danh sách
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Đăng nhập thành công -> Lưu session hiện tại
                localStorage.setItem("currentUser", JSON.stringify(user));
                
                alert(`Xin chào ${user.name}!`);
                if (user.role === "admin") {
                    window.location.href = "admin/dashboard.html";
                } else {
                    window.location.href = "index.html";
                }
            } else {
                // Đăng nhập thất bại
                alert("Sai email hoặc mật khẩu! Vui lòng kiểm tra lại.");
            }
        });
    }

    // ==========================================
    // 6. TRẠNG THÁI ĐĂNG NHẬP & ĐĂNG XUẤT
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
    // 7. ĐỔI MẬT KHẨU (LOGIC NÂNG CAO)
    // ==========================================
    const changePassForm = document.getElementById("changePassForm");
    if (changePassForm) {
        // Kiểm tra xem đã đăng nhập chưa
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            alert("Bạn cần đăng nhập để thực hiện chức năng này!");
            window.location.href = "login.html";
            return;
        }

        changePassForm.addEventListener("submit", function (e) {
            e.preventDefault();
            // Lấy giá trị từ form (Chú ý: file HTML phải có đúng ID này)
            const oldPassInput = document.querySelector("input[placeholder='Mật khẩu hiện tại']"); // Hoặc getElementById nếu bạn đã đặt ID
            const newPass = document.getElementById("newPass").value;
            const confirmPass = document.getElementById("confirmPass").value;
            
            // Nếu bạn chưa đặt ID cho ô mật khẩu cũ, hãy dùng dòng này
            // Nhưng tốt nhất hãy sửa HTML để thêm id="oldPass"
            const currentPassValue = oldPassInput ? oldPassInput.value : document.getElementById("oldPass").value; 

            // 1. Kiểm tra mật khẩu cũ
            if (currentPassValue !== currentUser.password) {
                alert("Mật khẩu hiện tại không đúng!");
                return;
            }

            // 2. Kiểm tra mật khẩu mới
            if (newPass.length < 3) {
                alert("Mật khẩu mới quá ngắn!"); return;
            }
            if (newPass !== confirmPass) {
                alert("Mật khẩu xác nhận không khớp!"); return;
            }

            // 3. Cập nhật vào danh sách tổng (listUsers)
            let users = JSON.parse(localStorage.getItem("listUsers")) || [];
            
            // Tìm và sửa user trong danh sách tổng
            const index = users.findIndex(u => u.email === currentUser.email);
            if (index !== -1) {
                users[index].password = newPass; // Đổi pass
                localStorage.setItem("listUsers", JSON.stringify(users)); // Lưu lại danh sách
                
                // Cập nhật lại session hiện tại
                currentUser.password = newPass;
                localStorage.setItem("currentUser", JSON.stringify(currentUser));

                alert("Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.");
                changePassForm.reset();
            }
        });
    }

    // 8. GÓP Ý
    const feedbackForm = document.getElementById("feedbackForm");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function(e){
            e.preventDefault();
            alert("Đã gửi góp ý!");
            feedbackForm.reset();
        })
    }
});
