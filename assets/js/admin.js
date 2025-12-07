/* =========================================
   ADMIN.JS - GREENTRIP (FULL CONTROL)
   Chức năng: Quản lý Tour, Booking, User, Feedback
   ========================================= */

// 1. Import thư viện Firebase
import { db } from "./firebase-config.js";
import { collection, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy, limit, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
    
    // --- 0. BẢO MẬT: KIỂM TRA QUYỀN ADMIN ---
    const user = JSON.parse(localStorage.getItem("currentUser"));
    
    // Nếu không phải admin -> Đá về trang login
    if (!user || user.role !== "admin") {
        alert("Bạn không có quyền truy cập trang quản trị!");
        window.location.href = "../login.html";
        return;
    }

    // Hiển thị tên Admin lên Menu
    const nameEl = document.querySelector(".admin-name");
    if(nameEl) nameEl.innerText = user.name;

    // Xử lý Đăng xuất
    const logBtn = document.getElementById("adminLogoutBtn");
    if(logBtn) {
        logBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if(confirm("Bạn chắc chắn muốn đăng xuất?")) {
                localStorage.removeItem("currentUser"); 
                window.location.href = "../index.html";
            }
        });
    }

    // --- 1. KHỞI TẠO DỮ LIỆU TOUR (Nếu chưa có) ---
    if (!localStorage.getItem("listTours")) {
        // Danh sách 9 tour mặc định
        const initialTours = [
            { id: "T001", name: "Đà Lạt Ngàn Hoa", price: 1500000, type: "Núi", img: "tour1.jpg" },
            { id: "T002", name: "Nha Trang Biển Gọi", price: 2300000, type: "Biển", img: "tour2.jpg" },
            { id: "T003", name: "Phú Quốc Đảo Ngọc", price: 3800000, type: "Biển", img: "tour3.jpg" },
            { id: "T004", name: "Vịnh Hạ Long", price: 2500000, type: "Biển", img: "tour4.jpg" },
            { id: "T005", name: "Sapa Fansipan", price: 1800000, type: "Núi", img: "tour5.jpg" },
            { id: "T006", name: "Nhật Bản Mùa Hoa", price: 25000000, type: "Quốc tế", img: "tour6.jpg" },
            { id: "T007", name: "Thái Lan Bangkok", price: 6500000, type: "Quốc tế", img: "tour7.jpg" },
            { id: "T008", name: "Miền Tây Sông Nước", price: 1200000, type: "Nông thôn", img: "tour8.jpg" },
            { id: "T009", name: "Hà Nội Phố Cổ", price: 800000, type: "Thành thị", img: "tour9.jpg" }
        ];
        localStorage.setItem("listTours", JSON.stringify(initialTours));
    }

    // --- 2. LOGIC DASHBOARD (TRANG CHỦ ADMIN) ---
    // Chỉ chạy khi đang ở trang dashboard.html
    const statTours = document.getElementById("stat-tours");
    if (statTours) {
        // A. Thống kê số lượng Tour
        const tours = JSON.parse(localStorage.getItem("listTours")) || [];
        statTours.innerText = tours.length;

        // B. Thống kê từ Firebase (Booking & Feedback)
        // Lắng nghe dữ liệu booking thay đổi
        onSnapshot(collection(db, "bookings"), (snap) => {
            let pendingCount = 0;
            let revenue = 0; // Doanh thu tạm tính

            snap.forEach(doc => {
                const data = doc.data();
                if (data.status === 'pending') pendingCount++;
                // Tính tổng tiền (Xử lý chuỗi "1.500.000đ" -> số)
                if (data.total) {
                    let price = parseInt(data.total.replace(/\D/g, ''));
                    revenue += price;
                }
            });

            document.getElementById("stat-bookings").innerText = pendingCount;
            document.getElementById("stat-customers").innerText = snap.size; // Tổng số đơn
            // document.getElementById("stat-revenue").innerText = new Intl.NumberFormat('vi-VN').format(revenue); // Nếu có chỗ hiện doanh thu
        });

        // Đếm feedback
        onSnapshot(collection(db, "feedbacks"), (snap) => {
            document.getElementById("stat-feedbacks").innerText = snap.size;
        });

        // C. Bảng Hoạt động gần đây (5 đơn mới nhất)
        const recentTable = document.getElementById("recentActivityTable");
        const qRecent = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(5));
        
        onSnapshot(qRecent, (snap) => {
            recentTable.innerHTML = "";
            if (snap.empty) {
                recentTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Chưa có hoạt động nào</td></tr>`;
            } else {
                snap.forEach(doc => {
                    const b = doc.data();
                    const badge = b.status === 'confirmed' ? '<span class="badge bg-success">Đã duyệt</span>' : '<span class="badge bg-warning text-dark">Chờ duyệt</span>';
                    
                    recentTable.innerHTML += `
                        <tr>
                            <td><small class="text-muted">${b.createdAt}</small></td>
                            <td><strong>${b.name}</strong></td>
                            <td>${b.tourName}</td>
                            <td>${badge}</td>
                        </tr>
                    `;
                });
            }
        });
    }

    // --- 3. QUẢN LÝ TOUR (MANAGE-TOUR.HTML) ---
    const tourTableBody = document.getElementById("tourTableBody");
    if (tourTableBody) {
        // Hàm vẽ bảng Tour
        function renderTours() {
            const list = JSON.parse(localStorage.getItem("listTours")) || [];
            tourTableBody.innerHTML = list.map(t => {
                // Xử lý ảnh (nếu là link online hay file cục bộ)
                const imgSrc = t.img.startsWith("http") || t.img.startsWith("assets") ? t.img : `../assets/img/${t.img}`;
                
                return `
                <tr>
                    <td>${t.id}</td>
                    <td><img src="${imgSrc}" width="60" class="rounded border" onerror="this.src='https://via.placeholder.com/60'"></td>
                    <td>${t.name}</td>
                    <td>${new Intl.NumberFormat('vi-VN').format(t.price)} đ</td>
                    <td><span class="badge bg-info text-dark">${t.type}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-del-tour" data-id="${t.id}" title="Xóa"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            }).join('');
        }
        renderTours();

        // Xử lý nút Xóa Tour
        tourTableBody.addEventListener("click", (e) => {
            if(e.target.closest(".btn-del-tour")) {
                if(confirm("Bạn chắc chắn muốn xóa tour này? (Hành động không thể hoàn tác)")) {
                    const id = e.target.closest(".btn-del-tour").dataset.id;
                    let list = JSON.parse(localStorage.getItem("listTours"));
                    list = list.filter(t => t.id !== id); // Lọc bỏ tour có ID này
                    localStorage.setItem("listTours", JSON.stringify(list));
                    renderTours(); // Vẽ lại bảng
                }
            }
        });

        // Xử lý Thêm Tour Mới
        const btnSave = document.getElementById("btnSaveTour");
        if(btnSave) {
            btnSave.addEventListener("click", () => {
                const name = document.getElementById("tourName").value;
                const price = document.getElementById("tourPrice").value;
                const type = document.getElementById("tourType").value;
                let img = document.getElementById("tourImg").value;

                if(!name || !price) { alert("Vui lòng nhập tên và giá tour!"); return; }
                if(!img) img = "tour1.jpg"; // Ảnh mặc định

                const list = JSON.parse(localStorage.getItem("listTours")) || [];
                
                // Tạo tour mới
                list.push({
                    id: "T" + Date.now(), // Tạo ID ngẫu nhiên theo thời gian
                    name: name,
                    price: price,
                    type: type,
                    img: img
                });

                localStorage.setItem("listTours", JSON.stringify(list));
                alert("Thêm tour thành công!");
                
                // Đóng modal và reset form
                document.getElementById("tourForm").reset();
                const modalEl = document.getElementById('tourModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                renderTours();
            });
        }

        // Mở Modal (dành cho nút Thêm)
        const btnOpenAdd = document.getElementById("btnOpenAddModal");
        if(btnOpenAdd) {
            btnOpenAdd.addEventListener("click", () => {
                document.getElementById("tourForm").reset();
                const modal = new bootstrap.Modal(document.getElementById('tourModal'));
                modal.show();
            });
        }
    }

    // --- 4. QUẢN LÝ BOOKING (FIREBASE) ---
    const bookingTableBody = document.querySelector("#bookingTable tbody"); 
    if (bookingTableBody) {
        // Lấy dữ liệu booking từ Firebase, sắp xếp mới nhất lên đầu
        const qBookings = query(collection(db, "bookings"), orderBy("createdAt", "desc"));

        onSnapshot(qBookings, (snap) => {
            bookingTableBody.innerHTML = "";
            
            if(snap.empty) {
                bookingTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Chưa có đơn hàng nào</td></tr>`;
                return;
            }

            snap.forEach(doc => {
                const b = doc.data();
                const isConfirmed = b.status === 'confirmed';
                const badge = isConfirmed ? '<span class="badge bg-success">Đã duyệt</span>' : '<span class="badge bg-warning text-dark">Chờ duyệt</span>';
                
                // Nút thao tác
                const actions = `
                    ${!isConfirmed ? `<button class="btn btn-sm btn-success btn-app me-1" data-id="${doc.id}" title="Duyệt đơn"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn btn-sm btn-danger btn-del" data-id="${doc.id}" title="Xóa đơn"><i class="fas fa-trash"></i></button>
                `;

                bookingTableBody.innerHTML += `
                <tr>
                    <td><small>${doc.id.slice(0,5)}...</small></td>
                    <td>${b.createdAt}</td>
                    <td>
                        <strong>${b.name}</strong><br>
                        <small class="text-muted">${b.phone}</small>
                    </td>
                    <td>
                        ${b.tourName}<br>
                        <small class="text-primary">${b.people} khách - ${b.total || '...'}</small>
                    </td>
                    <td>${badge}</td>
                    <td>${actions}</td>
                </tr>`;
            });
        });

        // Xử lý click Duyệt/Xóa
        bookingTableBody.addEventListener("click", async (e) => {
            const id = e.target.closest("button")?.dataset.id;
            
            // Duyệt
            if (e.target.closest(".btn-app")) {
                if(confirm("Xác nhận duyệt đơn hàng này?")) {
                    await updateDoc(doc(db, "bookings", id), { status: "confirmed" });
                }
            }
            // Xóa
            if (e.target.closest(".btn-del")) {
                if(confirm("Xóa vĩnh viễn đơn hàng này?")) {
                    await deleteDoc(doc(db, "bookings", id));
                }
            }
        });
    }

    // --- 5. QUẢN LÝ USER (LOCALSTORAGE) ---
    const userTableBody = document.getElementById("userTableBody");
    if (userTableBody) {
        function renderUsers() {
            const list = JSON.parse(localStorage.getItem("listUsers")) || [];
            userTableBody.innerHTML = list.map((u, i) => {
                const roleBadge = u.role === 'admin' ? '<span class="badge bg-danger">Admin</span>' : '<span class="badge bg-primary">User</span>';
                const statusBadge = u.status === 'active' ? '<span class="text-success fw-bold">Active</span>' : '<span class="text-danger fw-bold">Locked</span>';
                
                // Admin không thể tự khóa mình
                const btnAction = u.role !== 'admin' 
                    ? `<button class="btn btn-sm ${u.status==='active'?'btn-outline-danger':'btn-outline-success'} btn-status" data-i="${i}">
                        <i class="fas ${u.status==='active'?'fa-lock':'fa-unlock'}"></i>
                       </button>` 
                    : '-';

                return `
                <tr>
                    <td>#${i+1}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${roleBadge}</td>
                    <td>${statusBadge}</td>
                    <td>${btnAction}</td>
                </tr>`;
            }).join('');
        }
        renderUsers();
        
        // Xử lý Khóa/Mở khóa User
        userTableBody.addEventListener("click", e => {
            const btn = e.target.closest(".btn-status");
            if(btn) {
                const i = btn.dataset.i;
                let list = JSON.parse(localStorage.getItem("listUsers"));
                // Đảo ngược trạng thái
                list[i].status = list[i].status === 'active' ? 'locked' : 'active';
                localStorage.setItem("listUsers", JSON.stringify(list));
                renderUsers();
            }
        });
    }

    // --- 6. QUẢN LÝ GÓP Ý (FIREBASE) ---
    const fbTable = document.getElementById("feedbackTableBody");
    if(fbTable) {
        onSnapshot(collection(db, "feedbacks"), (snap) => {
            fbTable.innerHTML = "";
            const noData = document.getElementById("noDataMsg");
            
            if(snap.empty) {
                if(noData) noData.style.display = "block";
                return;
            }
            if(noData) noData.style.display = "none";

            snap.forEach(docSnap => {
                const f = docSnap.data();
                fbTable.innerHTML += `
                <tr>
                    <td>${f.createdAt}</td>
                    <td>
                        <strong>${f.name}</strong><br>
                        <small class="text-muted">${f.email}</small>
                    </td>
                    <td><span class="badge bg-info text-dark">${f.subject}</span></td>
                    <td>${f.message}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-del-fb" data-id="${docSnap.id}" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
            });
        });
        
        // Xóa góp ý
        fbTable.addEventListener("click", async (e) => {
            if(e.target.closest(".btn-del-fb")) {
                if(confirm("Xóa tin nhắn này?")) {
                    const id = e.target.closest(".btn-del-fb").dataset.id;
                    await deleteDoc(doc(db, "feedbacks", id));
                }
            }
        });
    }
});
