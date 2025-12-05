/* =========================================
   MAIN JAVASCRIPT FILE
   Chức năng: Xử lý sự kiện, banner slide, validate form
   [cite: 59, 142]
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    
    // 1. BANNER SLIDE (Sử dụng logic setInterval như yêu cầu)
    // [cite: 144]
    // Giả sử banner dùng Bootstrap Carousel, đoạn này sẽ cấu hình interval
    const myCarouselElement = document.querySelector('#heroCarousel');
    if (myCarouselElement) {
        // Khởi tạo carousel với interval 3 giây
        const carousel = new bootstrap.Carousel(myCarouselElement, {
            interval: 3000,
            ride: 'carousel',
            wrap: true
        });
        console.log("Banner slider initialized.");
    }

    // 2. XỬ LÝ TÌM KIẾM TOUR (Search Handling)
    // [cite: 6, 143]
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
                    card.closest(".col-md-4").style.display = "block"; // Hiển thị (giả sử layout dùng col-md-4)
                } else {
                    card.closest(".col-md-4").style.display = "none";  // Ẩn đi
                }
            });
        });
    }

    // 3. VALIDATE FORM ĐẶT TOUR (Booking Form Validation)
    // [cite: 10, 143]
    const bookingForm = document.getElementById("bookingForm");

    if (bookingForm) {
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Ngăn chặn gửi form mặc định để kiểm tra trước

            let isValid = true;
            
            // Lấy giá trị
            const name = document.getElementById("customerName").value.trim();
            const phone = document.getElementById("customerPhone").value.trim();
            const email = document.getElementById("customerEmail").value.trim();

            // Reset thông báo lỗi cũ (nếu có logic hiển thị lỗi UI)
            
            // Kiểm tra Họ tên
            if (name.length < 2) {
                alert("Vui lòng nhập họ tên hợp lệ!");
                isValid = false;
            }

            // Kiểm tra Số điện thoại (Cơ bản: phải là số và đủ 10 số)
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                alert("Số điện thoại phải bao gồm 10 chữ số!");
                isValid = false;
            }

            // Kiểm tra Email
            if (!email.includes("@") || !email.includes(".")) {
                alert("Email không hợp lệ!");
                isValid = false;
            }

            // Nếu dữ liệu hợp lệ
            if (isValid) {
                // Giả lập gửi yêu cầu thành công
                alert("Đặt tour thành công! Chúng tôi sẽ liên hệ sớm.");
                bookingForm.reset();
                // Ở bước thực tế có thể gọi API gửi dữ liệu về admin [cite: 22]
            }
        });
    }

    // 4. ACTIVE MENU ITEM (UX)
    // Tự động active menu dựa trên URL hiện tại
    const currentLocation = location.href;
    const menuItem = document.querySelectorAll('.nav-link');
    const menuLength = menuItem.length;
    for (let i = 0; i < menuLength; i++) {
        if (menuItem[i].href === currentLocation) {
            menuItem[i].classList.add("active");
        }
    }

});
const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Ngăn load lại trang
            
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            // Kiểm tra đơn giản
            if (email === "" || password === "") {
                alert("Vui lòng nhập đầy đủ email và mật khẩu!");
                return;
            }

            // Giả lập đăng nhập thành công
            // (Trong thực tế sẽ gọi API server ở đây)
            alert("Đăng nhập thành công! Chào mừng bạn quay lại.");
            window.location.href = "index.html"; // Chuyển về trang chủ
        });
    }

    // 6. XỬ LÝ ĐĂNG KÝ (Mô phỏng)
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = registerForm.querySelector('input[type="text"]').value;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;

            if (name === "" || email === "" || password === "") {
                alert("Vui lòng điền đầy đủ thông tin!");
                return;
            }

            // Giả lập đăng ký
            alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
            window.location.href = "login.html"; // Chuyển sang trang đăng nhập
        });
    }
