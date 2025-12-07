/* =========================================
   MAIN.JS - GREENTRIP (DYNAMIC FIREBASE)
   Chức năng: 
   - Đặt tour & Góp ý (Gửi lên Cloud)
   - Đăng nhập (Bảo mật Base64)
   - Hiển thị Tour từ Cloud (Tùy chọn)
   ========================================= */

// 1. Import kết nối từ file cấu hình (Nhớ file config phải đúng đường dẫn)
import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function () {

    // --- 0. KHỞI TẠO UI (BANNER SLIDE) ---
    const myCarouselElement = document.querySelector('#heroCarousel');
    if (myCarouselElement) {
        new bootstrap.Carousel(myCarouselElement, { interval: 3000, ride: 'carousel', wrap: true });
    }

    // --- 1. XỬ LÝ ĐẶT TOUR (GỬI LÊN FIREBASE) ---
    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            
            // Hiệu ứng nút bấm đang xử lý
            const btnSubmit = bookingForm.querySelector("button[type='submit']");
            const originalText = btnSubmit.innerText;
            btnSubmit.innerText = "Đang gửi đơn...";
            btnSubmit.disabled = true;

            try {
                // Lấy dữ liệu từ form
                const bookingData = {
                    name: document.getElementById("customerName").value,
                    phone: document.getElementById("customerPhone").value,
                    email: document.getElementById("customerEmail").value,
                    tourName: "Tour đã chọn (GreenTrip)", // Có thể lấy từ URL hoặc input ẩn
                    people: document.querySelector('input[type="number"]')?.value || 1,
                    note: document.querySelector('textarea')?.value || "",
                    status: "pending", // Trạng thái: Chờ xác nhận
                    createdAt: new Date().toLocaleString()
                };

                // Gửi lên đám mây (Collection: bookings)
                await addDoc(collection(db, "bookings"), bookingData);

                alert("✅ Đặt tour thành công! Admin GreenTrip sẽ liên hệ với bạn sớm.");
                window.location.href = "index.html"; // Quay về trang chủ
            } catch (error) {
                console.error("Lỗi gửi đơn:", error);
                alert("❌ Có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng!");
                btnSubmit.innerText = originalText;
                btnSubmit.disabled = false;
            }
        });
    }

    // --- 2. XỬ LÝ GÓP Ý (GỬI LÊN FIREBASE) ---
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
                alert("Cảm ơn bạn đã gửi góp ý cho GreenTrip!");
                feedbackForm.reset();
            } catch (err) {
                alert("Lỗi gửi tin nhắn.");
            }
        })
    }

    // --- 3. ĐĂNG NHẬP (BẢO MẬT ADMIN) ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const pass = loginForm.querySelector('input[type="password"]').value;

            // Mã hóa input để so sánh (admin@travel.com / admin123)
            // Bạn có thể đổi mã bí mật này bằng cách dùng console.log(btoa('mật_khẩu_mới'))
            const SECRET_EMAIL = "YWRtaW5AdHJhdmVsLmNvbQ=="; 
            const SECRET_PASS = "YWRtaW4xMjM="; 

            if (btoa(email) === SECRET_EMAIL && btoa(pass) === SECRET_PASS) {
                // Tạo session Admin
                const adminUser = { name: "Admin GreenTrip", role: "admin" };
                localStorage.setItem("currentUser", JSON.stringify(adminUser));
                
                alert("Xin chào Admin! Đang vào trang quản trị...");
                window.location.href = "admin/dashboard.html";
            } else {
                // Kiểm tra User thường (Lưu ở LocalStorage cho đơn giản)
                let users = JSON.parse(localStorage.getItem("listUsers")) || [];
                const user = users.find(u => u.email === email && u.password === pass);
                
                if (user) {
                    if(user.status === "locked") { alert("Tài khoản đã bị khóa!"); return; }
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    alert(`Chào mừng ${user.name} quay lại GreenTrip!`);
                    window.location.href = "index.html";
                } else {
                    alert("Sai email hoặc mật khẩu!");
                }
            }
        });
    }

    // --- 4. TÌM KIẾM & LỌC TOUR (CLIENT SIDE) ---
    const searchInput = document.getElementById("searchTourInput");
    const filterSelect = document.querySelector(".form-select");
    const tourCards = document.querySelectorAll(".tour-card");

    function filterTours() {
        const searchText = searchInput ? searchInput.value.toLowerCase() : "";
        const filterType = filterSelect ? filterSelect.value : "Tất cả";

        tourCards.forEach(card => {
            const title = card.querySelector(".tour-title").innerText.toLowerCase();
            const body = card.querySelector(".card-body").innerText;
            
            const matchSearch = title.includes(searchText);
            const matchType = filterType === "Tất cả" || body.includes(filterType);
            
            // Tìm thấy thì hiện, không thì ẩn
            if (matchSearch && matchType) {
                card.closest(".col-md-4").style.display = "block";
            } else {
                card.closest(".col-md-4").style.display = "none";
            }
        });
    }
    if (searchInput) searchInput.addEventListener("keyup", filterTours);
    if (filterSelect) filterSelect.addEventListener("change", filterTours);

    // --- 5. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP (MENU) ---
    function checkLoginStatus() {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const authContainer = document.querySelector(".navbar-nav.ms-auto .ms-2");

        if (currentUser && authContainer) {
            // Thay nút Đăng nhập bằng tên User
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
            
            // Xử lý đăng xuất
            document.getElementById("btnLogout").addEventListener("click", function(e) {
                e.preventDefault();
                if(confirm("Bạn muốn đăng xuất?")) {
                    localStorage.removeItem("currentUser");
                    window.location.href = "index.html";
                }
            });
        }
    }
    checkLoginStatus();
});
