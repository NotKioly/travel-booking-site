/* =========================================
   MAIN JAVASCRIPT FILE
   Chức năng: Xử lý sự kiện, banner slide, validate form, giả lập login/register
   [cite_start][cite: 59, 142]
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    
    // ==========================================
    // 1. BANNER SLIDE (Sử dụng Bootstrap Carousel)
    [cite_start]// [cite: 144]
    // ==========================================
    const myCarouselElement = document.querySelector('#heroCarousel');
    if (myCarouselElement) {
        const carousel = new bootstrap.Carousel(myCarouselElement, {
            interval: 3000, // Tự động chuyển sau 3 giây
            ride: 'carousel',
            wrap: true
        });
        console.log("Banner slider initialized.");
    }

    // ==========================================
    // 2. XỬ LÝ TÌM KIẾM TOUR (Search Filter)
    [cite_start]// [cite: 6, 143]
    // ==========================================
    const searchInput = document.getElementById("searchTourInput");
    const tourCards = document.querySelectorAll(".tour-card");

    if (searchInput) {
        searchInput.addEventListener("keyup", function (e) {
            const searchText = e.target.value.toLowerCase();

            tourCards.forEach(card => {
                const title = card.querySelector(".tour-title").innerText.toLowerCase();
                const price = card.querySelector(".tour-price").innerText.toLowerCase();
                
                // Tìm kiếm theo tên hoặc giá
                if (title.includes(searchText) || price.includes(searchText)) {
                    card.closest(".col-md-4").style.display = "block"; 
                } else {
                    card.closest(".col-md-4").style.display = "none";
                }
            });
        });
    }

    // ==========================================
    // 3. VALIDATE FORM ĐẶT TOUR (Booking)
    [cite_start]// [cite: 10, 143]
    // ==========================================
    const bookingForm = document.getElementById("bookingForm");

    if (bookingForm) {
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault(); 

            let isValid = true;
            
            // Lấy giá trị
            const name = document.getElementById("customerName").value.trim();
            const phone = document.getElementById("customerPhone").value.trim();
            const email = document.getElementById("customerEmail").value.trim();

            // Kiểm tra Họ tên
            if (name.length < 2) {
                alert("Vui lòng nhập họ tên hợp lệ!");
                isValid = false;
            }

            // Kiểm tra Số điện thoại (10 chữ số)
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                alert("Số điện thoại phải bao gồm đúng 10 chữ số!");
                isValid = false;
            }

            // Kiểm tra Email
            if (!email.includes("@") || !email.includes(".")) {
                alert("Email không hợp lệ!");
                isValid = false;
            }

            // Nếu dữ liệu hợp lệ
            if (isValid) {
                alert("Đặt tour thành công! Chúng tôi sẽ liên hệ xác nhận sớm.");
                bookingForm.reset();
                [cite_start]// [cite: 22] Thực tế sẽ gửi API tại đây
            }
        });
    }

    // ==========================================
    // 4. ACTIVE MENU ITEM (UX)
    // ==========================================
    const currentLocation = location.href;
    const menuItem = document.querySelectorAll('.nav-link');
    const menuLength = menuItem.length;
    for (let i = 0; i < menuLength; i++) {
        if (menuItem[i].href === currentLocation) {
            menuItem[i].classList.add("active");
        }
    }

    // ==========================================
    // 5. XỬ LÝ ĐĂNG NHẬP (Giả lập)
    [cite_start]// [cite: 5]
    // ==========================================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault(); 
            
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            if (email === "" || password === "") {
                alert("Vui lòng nhập đầy đủ email và mật khẩu!");
                return;
            }

            // Giả lập logic kiểm tra admin/user
            if(email === "admin@travel.com" && password === "admin123") {
                alert("Xin chào Admin! Chuyển hướng đến trang quản trị...");
                window.location.href = "admin/dashboard.html"; // Chuyển vào trang admin
            } else {
                alert("Đăng nhập thành công! Chào mừng bạn quay lại.");
                window.location.href = "index.html"; // Chuyển về trang chủ
            }
        });
    }

    // ==========================================
    // 6. XỬ LÝ ĐĂNG KÝ (Giả lập)
    [cite_start]// [cite: 5]
    // ==========================================
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = registerForm.querySelector('input[type="text"]').value; // Lấy input họ tên
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;

            // Kiểm tra checkbox điều khoản (nếu có)
            const terms = document.getElementById("terms");
            if (terms && !terms.checked) {
                alert("Bạn vui lòng đồng ý với điều khoản sử dụng!");
                return;
            }

            if (name === "" || email === "" || password === "") {
                alert("Vui lòng điền đầy đủ thông tin!");
                return;
            }

            alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
            window.location.href = "login.html"; 
        });
    }

    // ==========================================
    // 7. XỬ LÝ ĐỔI MẬT KHẨU (Mới cập nhật)
    // ==========================================
    const changePassForm = document.getElementById("changePassForm");
    if (changePassForm) {
        changePassForm.addEventListener("submit", function (e) {
            e.preventDefault();
            
            const newPass = document.getElementById("newPass").value;
            const confirmPass = document.getElementById("confirmPass").value;

            if (newPass !== confirmPass) {
                alert("Mật khẩu mới không trùng khớp!");
                return;
            }

            if (newPass.length < 6) {
                alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
                return;
            }

            alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            // Giả lập đăng xuất sau khi đổi pass
            window.location.href = "login.html";
        });
    }

    // ==========================================
    // 8. XỬ LÝ GỬI GÓP Ý / LIÊN HỆ (Mới cập nhật)
    [cite_start]// [cite: 12]
    // ==========================================
    const feedbackForm = document.getElementById("feedbackForm");
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function (e) {
            e.preventDefault();
            
            // Validate đơn giản
            const content = feedbackForm.querySelector("textarea").value;
            if (content.trim() === "") {
                alert("Vui lòng nhập nội dung góp ý!");
                return;
            }

            // Giả lập gửi dữ liệu thành công
            alert("Cảm ơn bạn đã gửi góp ý! Chúng tôi sẽ phản hồi sớm nhất qua email.");
            feedbackForm.reset();
        });
    }

});
