/* =========================================
   ADMIN JAVASCRIPT FILE - TRAVELSITE
   Chức năng: Quản lý Tour, Booking, User & Bảo mật
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    
    // ==========================================
    // 1. KIỂM TRA QUYỀN ADMIN (BẢO MẬT)
    // ==========================================
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    // Nếu chưa đăng nhập hoặc không phải admin -> Đá về trang login
    if (!currentUser || currentUser.role !== "admin") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "../login.html";
        return; // Dừng code
    }

    // Hiển thị tên Admin trên Sidebar (nếu có element)
    const adminNameEl = document.querySelector(".admin-name");
    if(adminNameEl) adminNameEl.innerText = currentUser.name;


    // ==========================================
    // 2. XỬ LÝ ĐĂNG XUẤT
    // ==========================================
    const logoutBtn = document.getElementById("adminLogoutBtn");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", function(e){
            e.preventDefault();
            if(confirm("Đăng xuất khỏi trang quản trị?")) {
                localStorage.removeItem("currentUser"); // Xóa session
                window.location.href = "../index.html";
            }
        });
    }

    // ==========================================
    // 3. QUẢN LÝ USER (ĐỒNG BỘ VỚI MAIN.JS)
    // ==========================================
    const userTableBody = document.getElementById("userTableBody");
    if (userTableBody) {
        renderUserTable();

        // Hàm vẽ bảng user từ LocalStorage
        function renderUserTable() {
            const users = JSON.parse(localStorage.getItem("listUsers")) || [];
            userTableBody.innerHTML = ""; // Xóa trắng cũ

            users.forEach((user, index) => {
                const row = document.createElement("tr");
                // Xác định trạng thái (Mô phỏng: admin luôn active, user có thể bị khóa)
                // Ở đây mình thêm thuộc tính 'status' vào user nếu chưa có
                if(!user.status) user.status = "active"; 

                const statusBadge = user.status === "active" 
                    ? '<span class="text-success"><i class="fas fa-circle small"></i> Hoạt động</span>' 
                    : '<span class="text-danger"><i class="fas fa-circle small"></i> Đã khóa</span>';
                
                const roleBadge = user.role === "admin" 
                    ? '<span class="badge bg-danger">Admin</span>' 
                    : '<span class="badge bg-primary">User</span>';

                // Nút thao tác (Admin không được khóa chính mình)
                let actionBtn = "";
                if(user.role !== "admin") {
                    if(user.status === "active") {
                        actionBtn = `<button class="btn btn-sm btn-outline-danger btn-toggle-status" data-index="${index}" title="Khóa"><i class="fas fa-lock"></i></button>`;
                    } else {
                        actionBtn = `<button class="btn btn-sm btn-outline-success btn-toggle-status" data-index="${index}" title="Mở khóa"><i class="fas fa-unlock"></i></button>`;
                    }
                }

                row.innerHTML = `
                    <td>#${index + 1}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${roleBadge}</td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                `;
                userTableBody.appendChild(row);
            });
        }

        // Xử lý sự kiện click Khóa/Mở khóa
        userTableBody.addEventListener("click", function(e) {
            const btn = e.target.closest(".btn-toggle-status");
            if(btn) {
                const index = btn.getAttribute("data-index");
                let users = JSON.parse(localStorage.getItem("listUsers"));
                
                // Đổi trạng thái
                if(users[index].status === "active" || !users[index].status) {
                    if(confirm(`Khóa tài khoản ${users[index].email}?`)) users[index].status = "locked";
                } else {
                    if(confirm(`Mở khóa tài khoản ${users[index].email}?`)) users[index].status = "active";
                }
                
                localStorage.setItem("listUsers", JSON.stringify(users)); // Lưu lại
                renderUserTable(); // Vẽ lại bảng
            }
        });
    }

    // ==========================================
    // 4. QUẢN LÝ TOUR (LOCAL STORAGE)
    // ==========================================
    const tourTableBody = document.getElementById("tourTableBody");
    const saveTourBtn = document.getElementById("saveTourBtn");

    // Khởi tạo dữ liệu Tour mẫu nếu chưa có
    if (!localStorage.getItem("listTours")) {
        const initialTours = [
            { id: "T001", name: "Nha Trang 3N2Đ", price: 2300000, type: "Biển", img: "tour1.jpg" },
            { id: "T002", name: "Đà Lạt Ngàn Hoa", price: 1200000, type: "Núi", img: "tour2.jpg" }
        ];
        localStorage.setItem("listTours", JSON.stringify(initialTours));
    }

    if (tourTableBody) {
        renderTourTable();

        function renderTourTable() {
            const tours = JSON.parse(localStorage.getItem("listTours")) || [];
            tourTableBody.innerHTML = "";
            
            tours.forEach((tour, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${tour.id}</td>
                    <td><img src="../assets/img/${tour.img}" onerror="this.src='https://via.placeholder.com/60'" width="60" class="rounded"></td>
                    <td>${tour.name}</td>
                    <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price)}</td>
                    <td>${tour.type}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-delete-tour" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tourTableBody.appendChild(row);
            });
        }

        // Thêm Tour Mới
        if(saveTourBtn) {
            saveTourBtn.addEventListener("click", function() {
                const name = document.getElementById("tourNameInput").value;
                const price = document.getElementById("tourPriceInput").value;
                const type = document.getElementById("tourTypeSelect").value;

                if(!name || !price) { alert("Vui lòng nhập đủ thông tin"); return; }

                const tours = JSON.parse(localStorage.getItem("listTours")) || [];
                const newTour = {
                    id: "T" + Math.floor(Math.random() * 10000), // Random ID
                    name: name,
                    price: price,
                    type: type,
                    img: "tour1.jpg" // Ảnh mặc định
                };

                tours.push(newTour);
                localStorage.setItem("listTours", JSON.stringify(tours));
                
                alert("Thêm tour thành công!");
                renderTourTable();
                
                // Đóng modal (thủ công)
                const modalEl = document.querySelector('#addTourModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
            });
        }

        // Xóa Tour
        tourTableBody.addEventListener("click", function(e){
            const btn = e.target.closest(".btn-delete-tour");
            if(btn) {
                if(confirm("Xóa tour này?")) {
                    const index = btn.getAttribute("data-index");
                    let tours = JSON.parse(localStorage.getItem("listTours"));
                    tours.splice(index, 1);
                    localStorage.setItem("listTours", JSON.stringify(tours));
                    renderTourTable();
                }
            }
        });
    }

    // ==========================================
    // 5. QUẢN LÝ BOOKING (MÔ PHỎNG)
    // ==========================================
    // Phần này xử lý sự kiện click đơn giản cho giao diện
    const bookingTable = document.querySelector("#bookingTable");
    if(bookingTable) {
        bookingTable.addEventListener("click", function(e) {
            // Nút duyệt
            if(e.target.closest(".btn-approve")) {
                const row = e.target.closest("tr");
                row.querySelector(".badge").className = "badge bg-success";
                row.querySelector(".badge").innerText = "Đã xác nhận";
                alert("Đã duyệt đơn hàng!");
                e.target.closest("td").innerHTML = '<i class="fas fa-check text-success"></i>';
            }
            // Nút hủy
            if(e.target.closest(".btn-reject")) {
                if(confirm("Hủy đơn này?")) {
                    const row = e.target.closest("tr");
                    row.querySelector(".badge").className = "badge bg-danger";
                    row.querySelector(".badge").innerText = "Đã hủy";
                    e.target.closest("td").innerHTML = '<i class="fas fa-times text-danger"></i>';
                }
            }
        });
    }
});
