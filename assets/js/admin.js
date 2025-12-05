/* =========================================
   ADMIN JAVASCRIPT FILE
   Chức năng: Xử lý logic cho trang quản trị (Thêm/Sửa/Xóa Tour, Duyệt đơn, Quản lý User)
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. QUẢN LÝ TOUR (manage-tour.html)
    // ==========================================
    const tourTableBody = document.querySelector("#tourTableBody"); // Cần thêm ID này vào tbody trong HTML
    const saveTourBtn = document.querySelector("#saveTourBtn");     // Cần thêm ID này vào nút Lưu trong Modal

    // A. Chức năng Thêm Tour mới (Mô phỏng)
    if (saveTourBtn && tourTableBody) {
        saveTourBtn.addEventListener("click", function () {
            // Lấy dữ liệu từ form (giả sử input có ID tương ứng)
            const tourName = document.querySelector("#tourNameInput").value;
            const tourPrice = document.querySelector("#tourPriceInput").value;
            const tourType = document.querySelector("#tourTypeSelect").value;

            if (tourName === "" || tourPrice === "") {
                alert("Vui lòng nhập đủ thông tin!");
                return;
            }

            // Tạo dòng mới
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>#T${Math.floor(Math.random() * 1000)}</td>
                <td><img src="../assets/img/tour1.jpg" alt="Tour" width="60" class="rounded"></td>
                <td>${tourName}</td>
                <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tourPrice)}</td>
                <td>${tourType}</td>
                <td>
                    <button class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            `;

            // Thêm vào bảng
            tourTableBody.appendChild(newRow);
            
            // Đóng modal và reset form (Dùng Bootstrap API)
            const modalEl = document.querySelector('#addTourModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            document.querySelector("form").reset();
            
            alert("Đã thêm tour mới thành công!");
        });
    }

    // B. Chức năng Xóa Tour (Sử dụng Event Delegation)
    if (tourTableBody) {
        tourTableBody.addEventListener("click", function (e) {
            if (e.target.closest(".delete-btn")) {
                if (confirm("Bạn có chắc chắn muốn xóa tour này không?")) {
                    e.target.closest("tr").remove();
                }
            }
        });
    }


    // ==========================================
    // 2. QUẢN LÝ ĐƠN ĐẶT (manage-booking.html)
    // ==========================================
    // Tìm tất cả các nút Duyệt và Hủy
    const approveBtns = document.querySelectorAll(".btn-approve");
    const rejectBtns = document.querySelectorAll(".btn-reject");

    // Xử lý nút Duyệt (Check)
    approveBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const row = this.closest("tr");
            const badge = row.querySelector(".badge");
            
            badge.className = "badge bg-success";
            badge.innerText = "Đã xác nhận";
            
            alert("Đã xác nhận đơn hàng!");
            this.parentElement.innerHTML = '<button class="btn btn-sm btn-outline-secondary"><i class="fas fa-eye"></i></button>'; // Ẩn nút xử lý đi
        });
    });

    // Xử lý nút Hủy (X)
    rejectBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            if(confirm("Bạn muốn hủy đơn này?")) {
                const row = this.closest("tr");
                const badge = row.querySelector(".badge");
                
                badge.className = "badge bg-danger";
                badge.innerText = "Đã hủy";
                
                this.parentElement.innerHTML = '<button class="btn btn-sm btn-outline-secondary"><i class="fas fa-eye"></i></button>';
            }
        });
    });


    // ==========================================
    // 3. QUẢN LÝ NGƯỜI DÙNG (manage-user.html)
    // ==========================================
    const lockBtns = document.querySelectorAll(".btn-lock-user");
    const unlockBtns = document.querySelectorAll(".btn-unlock-user");

    // Xử lý Khóa tài khoản
    // Lưu ý: Cần gán class .btn-lock-user cho nút khóa trong HTML trước
    document.addEventListener("click", function(e){
        // Nút Khóa
        if(e.target.closest(".btn-lock-user")) {
            if(confirm("Khóa tài khoản này?")) {
                const row = e.target.closest("tr");
                const statusSpan = row.querySelector("td:nth-child(5) span");
                
                // Đổi trạng thái hiển thị
                statusSpan.className = "text-danger";
                statusSpan.innerHTML = '<i class="fas fa-circle small"></i> Đã khóa';
                
                // Đổi nút thành Mở khóa
                const actionTd = row.querySelector("td:last-child");
                actionTd.innerHTML = '<button class="btn btn-sm btn-outline-success btn-unlock-user" title="Mở khóa"><i class="fas fa-unlock"></i></button>';
            }
        }

        // Nút Mở khóa
        if(e.target.closest(".btn-unlock-user")) {
            if(confirm("Mở khóa tài khoản này?")) {
                const row = e.target.closest("tr");
                const statusSpan = row.querySelector("td:nth-child(5) span");
                
                // Đổi trạng thái hiển thị
                statusSpan.className = "text-success";
                statusSpan.innerHTML = '<i class="fas fa-circle small"></i> Hoạt động';
                
                // Đổi nút thành Khóa
                const actionTd = row.querySelector("td:last-child");
                actionTd.innerHTML = '<button class="btn btn-sm btn-outline-danger btn-lock-user" title="Khóa tài khoản"><i class="fas fa-lock"></i></button>';
            }
        }
    });

    // ==========================================
    // 4. ĐĂNG XUẤT
    // ==========================================
    const logoutBtn = document.querySelector(".nav-link.text-danger");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if(confirm("Đăng xuất khỏi trang quản trị?")) {
                window.location.href = "../index.html";
            }
        });
    }

});
