/* =========================================
   ADMIN.JS - GREENTRIP (FIXED LOGOUT)
   ========================================= */
import { db } from "./firebase-config.js";
import { collection, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy, limit, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
    
    // --- 1. XỬ LÝ ĐĂNG XUẤT (Ưu tiên chạy trước) ---
    const logBtn = document.getElementById("adminLogoutBtn");
    if(logBtn) {
        logBtn.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("Đã bấm nút đăng xuất"); // Kiểm tra trong Console

            if(confirm("Bạn chắc chắn muốn đăng xuất khỏi trang quản trị?")) {
                localStorage.removeItem("currentUser"); 
                // Chuyển hướng về trang chủ (nhảy ra khỏi thư mục admin)
                window.location.href = "../index.html";
            }
        });
    } else {
        console.error("Lỗi: Không tìm thấy nút có id='adminLogoutBtn' trong HTML");
    }

    // --- 2. BẢO MẬT: CHECK QUYỀN ADMIN ---
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.role !== "admin") {
        alert("Bạn không có quyền truy cập trang quản trị!");
        window.location.href = "../login.html";
        return; // Dừng toàn bộ code phía sau nếu không phải admin
    }

    // Hiển thị tên Admin
    const nameEl = document.querySelector(".admin-name");
    if(nameEl) nameEl.innerText = user.name;

    // --- 3. KHỞI TẠO DỮ LIỆU TOUR (ĐÃ THÊM T010) ---
    if (!localStorage.getItem("listTours")) {
        const initialTours = [
            { id: "T001", name: "Đà Lạt Ngàn Hoa", price: 1500000, type: "Núi", img: "tour1.jpg" },
            { id: "T002", name: "Nha Trang Biển Gọi", price: 2300000, type: "Biển", img: "tour2.jpg" },
            { id: "T003", name: "Phú Quốc Đảo Ngọc", price: 3800000, type: "Biển", img: "tour3.jpg" },
            { id: "T004", name: "Vịnh Hạ Long", price: 2500000, type: "Biển", img: "tour4.jpg" },
            { id: "T005", name: "Sapa Fansipan", price: 1800000, type: "Núi", img: "tour5.jpg" },
            { id: "T006", name: "Nhật Bản Mùa Hoa", price: 25000000, type: "Quốc tế", img: "tour6.jpg" },
            { id: "T007", name: "Thái Lan Bangkok", price: 6500000, type: "Quốc tế", img: "tour7.jpg" },
            { id: "T008", name: "Miền Tây Sông Nước", price: 1200000, type: "Nông thôn", img: "tour8.jpg" },
            { id: "T009", name: "Hà Nội Phố Cổ", price: 800000, type: "Thành thị", img: "tour9.jpg" },
            // TOUR MỚI
            { id: "T010", name: "Thanh Hóa - Sầm Sơn", price: 1800000, type: "Biển", img: "tour10.jpg" }
        ];
        localStorage.setItem("listTours", JSON.stringify(initialTours));
    }

    // --- 4. DASHBOARD LOGIC ---
    const statTours = document.getElementById("stat-tours");
    if (statTours) {
        // Đếm Tour từ LocalStorage
        const tours = JSON.parse(localStorage.getItem("listTours")) || [];
        statTours.innerText = tours.length;

        // Đếm từ Firebase
        onSnapshot(collection(db, "bookings"), (snap) => {
            let pendingCount = 0;
            snap.forEach(doc => { if (doc.data().status === 'pending') pendingCount++; });
            document.getElementById("stat-bookings").innerText = pendingCount;
            document.getElementById("stat-customers").innerText = snap.size;
        });

        onSnapshot(collection(db, "feedbacks"), (snap) => {
            document.getElementById("stat-feedbacks").innerText = snap.size;
        });

        // Bảng Recent Activity
        const recentTable = document.getElementById("recentActivityTable");
        const qRecent = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(5));
        onSnapshot(qRecent, (snap) => {
            recentTable.innerHTML = "";
            if (snap.empty) {
                recentTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Chưa có hoạt động nào</td></tr>`;
            } else {
                snap.forEach(doc => {
                    const b = doc.data();
                    const badge = b.status === 'confirmed' 
                        ? '<span class="badge bg-success">Đã duyệt</span>' 
                        : '<span class="badge bg-warning text-dark">Chờ duyệt</span>';
                    
                    recentTable.innerHTML += `
                        <tr>
                            <td><small class="text-muted">${b.createdAt}</small></td>
                            <td><strong>${b.name}</strong></td>
                            <td>${b.tourName}</td>
                            <td>${badge}</td>
                        </tr>`;
                });
            }
        });
    }

    // --- 5. QUẢN LÝ TOUR (Local Storage) ---
    const tourTableBody = document.getElementById("tourTableBody");
    if (tourTableBody) {
        function renderTours() {
            const list = JSON.parse(localStorage.getItem("listTours")) || [];
            tourTableBody.innerHTML = list.map(t => {
                const imgSrc = t.img.startsWith("http") || t.img.startsWith("assets") ? t.img : `../assets/img/${t.img}`;
                return `
                <tr>
                    <td>${t.id}</td>
                    <td><img src="${imgSrc}" width="60" class="rounded border" onerror="this.src='https://via.placeholder.com/60'"></td>
                    <td>${t.name}</td>
                    <td>${new Intl.NumberFormat('vi-VN').format(t.price)} đ</td>
                    <td><span class="badge bg-info text-dark">${t.type}</span></td>
                    <td><button class="btn btn-sm btn-danger btn-del-tour" data-id="${t.id}" title="Xóa"><i class="fas fa-trash"></i></button></td>
                </tr>`;
            }).join('');
        }
        renderTours();

        tourTableBody.addEventListener("click", (e) => {
            if(e.target.closest(".btn-del-tour")) {
                if(confirm("Bạn chắc chắn muốn xóa tour này?")) {
                    const id = e.target.closest(".btn-del-tour").dataset.id;
                    let list = JSON.parse(localStorage.getItem("listTours"));
                    list = list.filter(t => t.id !== id);
                    localStorage.setItem("listTours", JSON.stringify(list));
                    renderTours();
                }
            }
        });

        // Thêm Tour
        const btnSave = document.getElementById("btnSaveTour");
        if(btnSave) {
            btnSave.addEventListener("click", () => {
                const name = document.getElementById("tourName").value;
                const price = document.getElementById("tourPrice").value;
                const type = document.getElementById("tourType").value;
                let img = document.getElementById("tourImg").value || "tour1.jpg";

                const list = JSON.parse(localStorage.getItem("listTours")) || [];
                list.push({ id: "T" + Date.now(), name, price, type, img });
                localStorage.setItem("listTours", JSON.stringify(list));
                alert("Thêm tour thành công!");
                
                // Đóng Modal
                const modalEl = document.getElementById('tourModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                renderTours();
                document.getElementById("tourForm").reset();
            });
        }
        
        // Mở modal (cho nút Thêm)
        const btnOpen = document.getElementById("btnOpenAddModal");
        if(btnOpen) {
            btnOpen.addEventListener("click", () => {
                document.getElementById("tourForm").reset();
                const modal = new bootstrap.Modal(document.getElementById('tourModal'));
                modal.show();
            })
        }
    }

    // --- 6. QUẢN LÝ BOOKING (Firebase) ---
    const bookingTableBody = document.querySelector("#bookingTable tbody"); 
    if (bookingTableBody) {
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
                
                const actions = `
                    ${!isConfirmed ? `<button class="btn btn-sm btn-success btn-app me-1" data-id="${doc.id}" title="Duyệt đơn"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn btn-sm btn-danger btn-del" data-id="${doc.id}" title="Xóa đơn"><i class="fas fa-trash"></i></button>
                `;

                bookingTableBody.innerHTML += `
                <tr>
                    <td>${b.createdAt}</td>
                    <td><strong>${b.name}</strong><br><small class="text-muted">${b.phone}</small></td>
                    <td>${b.tourName}<br><small class="text-primary">${b.people} khách - ${b.total || '...'}</small></td>
                    <td>${badge}</td>
                    <td>${actions}</td>
                </tr>`;
            });
        });

        bookingTableBody.addEventListener("click", async (e) => {
            const id = e.target.closest("button")?.dataset.id;
            if (e.target.closest(".btn-app")) {
                if(confirm("Duyệt đơn hàng này?")) await updateDoc(doc(db, "bookings", id), { status: "confirmed" });
            }
            if (e.target.closest(".btn-del")) {
                if(confirm("Xóa vĩnh viễn đơn này?")) await deleteDoc(doc(db, "bookings", id));
            }
        });
    }

    // --- 7. QUẢN LÝ USER ---
    const userTableBody = document.getElementById("userTableBody");
    if (userTableBody) {
        // Lấy User từ Firebase (Nâng cao)
        onSnapshot(collection(db, "users"), (snapshot) => {
            userTableBody.innerHTML = "";
            if(snapshot.empty) {
                userTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Chưa có người dùng</td></tr>`;
                return;
            }
            let index = 1;
            snapshot.forEach(docSnap => {
                const u = docSnap.data();
                const isActive = u.status === 'active';
                const statusBadge = isActive ? '<span class="text-success fw-bold">Active</span>' : '<span class="text-danger fw-bold">Locked</span>';
                
                const btnAction = u.role !== 'admin' 
                    ? `<button class="btn btn-sm ${isActive?'btn-outline-danger':'btn-outline-success'} btn-toggle-user" data-id="${docSnap.id}" data-status="${isActive?'locked':'active'}">
                        <i class="fas ${isActive?'fa-lock':'fa-unlock'}"></i>
                       </button>` : '-';

                userTableBody.innerHTML += `
                <tr>
                    <td>${index++}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.role==='admin'?'<span class="badge bg-danger">Admin</span>':'<span class="badge bg-primary">User</span>'}</td>
                    <td>${statusBadge}</td>
                    <td>${btnAction}</td>
                </tr>`;
            });
        });

        userTableBody.addEventListener("click", async (e) => {
            const btn = e.target.closest(".btn-toggle-user");
            if (btn) {
                const id = btn.dataset.id;
                const newStatus = btn.dataset.status;
                if(confirm(`Bạn muốn ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
                    await updateDoc(doc(db, "users", id), { status: newStatus });
                }
            }
        });
    }

    // --- 8. QUẢN LÝ GÓP Ý ---
    const fbTable = document.getElementById("feedbackTableBody");
    if(fbTable) {
        onSnapshot(collection(db, "feedbacks"), (snap) => {
            fbTable.innerHTML = "";
            document.getElementById("noDataMsg").style.display = snap.empty ? "block" : "none";
            snap.forEach(docSnap => {
                const f = docSnap.data();
                fbTable.innerHTML += `
                <tr>
                    <td>${f.createdAt}</td>
                    <td><strong>${f.name}</strong><br><small class="text-muted">${f.email}</small></td>
                    <td>${f.subject}</td>
                    <td>${f.message}</td>
                    <td><button class="btn btn-sm btn-danger btn-del-fb" data-id="${docSnap.id}"><i class="fas fa-trash"></i></button></td>
                </tr>`;
            });
        });
        fbTable.addEventListener("click", async (e) => {
            if(e.target.closest(".btn-del-fb") && confirm("Xóa tin nhắn này?")) {
                await deleteDoc(doc(db, "feedbacks", e.target.closest(".btn-del-fb").dataset.id));
            }
        });
    }
});
