/* =========================================
   ADMIN.JS - GREENTRIP (FULL DYNAMIC)
   Chức năng: Dashboard, Tour, Booking, User, Feedback
   Kết nối: Firebase Firestore
   ========================================= */

import { db } from "./firebase-config.js";
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
    
    // --- 0. BẢO MẬT: CHECK QUYỀN ADMIN ---
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.role !== "admin") {
        alert("Bạn không có quyền truy cập trang quản trị!");
        window.location.href = "../login.html";
        return;
    }

    // Hiển thị tên Admin
    const nameEl = document.querySelector(".admin-name");
    if(nameEl) nameEl.innerText = user.name;

    // Đăng xuất
    const logBtn = document.getElementById("adminLogoutBtn");
    if(logBtn) logBtn.addEventListener("click", (e) => { 
        e.preventDefault();
        if(confirm("Đăng xuất khỏi hệ thống?")) {
            localStorage.removeItem("currentUser"); 
            window.location.href="../index.html"; 
        }
    });

    // ============================================================
    // 1. DASHBOARD LOGIC (THỐNG KÊ REALTIME)
    // ============================================================
    const statTours = document.getElementById("stat-tours");
    const statBookings = document.getElementById("stat-bookings");
    const statFeedbacks = document.getElementById("stat-feedbacks");
    const statCustomers = document.getElementById("stat-customers"); // Dùng đếm khách
    const recentTable = document.getElementById("recentActivityTable");

    if (statTours) { // Chỉ chạy nếu đang ở trang dashboard.html
        
        // A. Đếm Tour
        onSnapshot(collection(db, "tours"), (snap) => {
            statTours.innerText = snap.size;
        });

        // B. Đếm Feedback
        onSnapshot(collection(db, "feedbacks"), (snap) => {
            statFeedbacks.innerText = snap.size;
        });

        // C. Đếm Booking & Tính toán
        // Query: Lấy đơn hàng mới nhất để hiện bảng Recent
        const qRecent = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(5));

        onSnapshot(collection(db, "bookings"), (snap) => {
            let pendingCount = 0;
            let totalCustomers = snap.size; // Tạm tính tổng đơn là tổng khách

            snap.forEach(doc => {
                const data = doc.data();
                if (data.status === 'pending') pendingCount++;
            });

            // Cập nhật số liệu lên Dashboard
            statBookings.innerText = pendingCount;
            statCustomers.innerText = totalCustomers;
        });

        // D. Bảng Hoạt động gần đây (Recent Activity)
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

    // ============================================================
    // 2. QUẢN LÝ TOUR (MANAGE-TOUR.HTML)
    // ============================================================
    const tourTableBody = document.getElementById("tourTableBody");
    const btnSaveTour = document.getElementById("btnSaveTour");
    const btnOpenAddModal = document.getElementById("btnOpenAddModal");
    let tourModal;
    if(document.getElementById('tourModal')) tourModal = new bootstrap.Modal(document.getElementById('tourModal'));

    if (tourTableBody) {
        // Tải danh sách Tour từ Cloud
        onSnapshot(collection(db, "tours"), (snap) => {
            tourTableBody.innerHTML = "";
            snap.forEach((docSnap) => {
                const t = docSnap.data();
                tourTableBody.innerHTML += `
                <tr>
                    <td>${t.code || '...'}</td>
                    <td><img src="${t.img}" width="60" class="rounded" onerror="this.src='https://via.placeholder.com/60'"></td>
                    <td>${t.name}</td>
                    <td>${new Intl.NumberFormat('vi-VN').format(t.price)} đ</td>
                    <td>${t.type}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-del-tour" data-id="${docSnap.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        });

        // Xóa Tour
        tourTableBody.addEventListener("click", async (e) => {
            if(e.target.closest(".btn-del-tour")) {
                if(confirm("Bạn chắc chắn muốn xóa tour này vĩnh viễn?")) {
                    const id = e.target.closest(".btn-del-tour").dataset.id;
                    await deleteDoc(doc(db, "tours", id));
                }
            }
        });

        // Mở Modal Thêm mới
        if(btnOpenAddModal) btnOpenAddModal.addEventListener("click", () => {
            document.getElementById("tourForm").reset();
            document.getElementById("modalTitle").innerText = "Thêm Tour Mới";
            tourModal.show();
        });

        // Lưu Tour lên Cloud
        if(btnSaveTour) btnSaveTour.addEventListener("click", async () => {
            const name = document.getElementById("tourName").value;
            const price = document.getElementById("tourPrice").value;
            const type = document.getElementById("tourType").value;
            let img = document.getElementById("tourImg").value || "https://via.placeholder.com/400x250";

            if(!name || !price) { alert("Vui lòng nhập tên và giá!"); return; }

            const btnText = btnSaveTour.innerText;
            btnSaveTour.innerText = "Đang lưu...";
            btnSaveTour.disabled = true;

            try {
                await addDoc(collection(db, "tours"), {
                    code: "T" + Math.floor(Math.random() * 10000),
                    name, price, type, img
                });
                alert("Thêm tour thành công!");
                tourModal.hide();
            } catch (err) {
                alert("Lỗi lưu tour!");
                console.error(err);
            } finally {
                btnSaveTour.innerText = btnText;
                btnSaveTour.disabled = false;
            }
        });
    }

    // ============================================================
    // 3. QUẢN LÝ BOOKING (MANAGE-BOOKING.HTML)
    // ============================================================
    const bookingTableBody = document.querySelector("#bookingTable tbody"); 
    if (bookingTableBody) {
        // Lấy danh sách booking, sắp xếp mới nhất lên đầu
        const qBookings = query(collection(db, "bookings"), orderBy("createdAt", "desc"));

        onSnapshot(qBookings, (snap) => {
            bookingTableBody.innerHTML = "";
            snap.forEach((docSnap) => {
                const b = docSnap.data();
                const isConfirmed = b.status === 'confirmed';
                const badge = isConfirmed ? '<span class="badge bg-success">Đã xác nhận</span>' : '<span class="badge bg-warning text-dark">Chờ xác nhận</span>';
                
                // Nút thao tác: Nếu đã duyệt thì ẩn nút Check, hiện nút Xóa
                const actions = `
                    ${!isConfirmed ? `<button class="btn btn-sm btn-success btn-approve me-1" data-id="${docSnap.id}" title="Duyệt"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn btn-sm btn-danger btn-del-booking" data-id="${docSnap.id}" title="Xóa"><i class="fas fa-trash"></i></button>
                `;

                bookingTableBody.innerHTML += `
                <tr>
                    <td>${b.createdAt}</td>
                    <td><strong>${b.name}</strong><br><small class="text-muted">${b.phone}</small></td>
                    <td>${b.tourName}<br><small>${b.people} khách</small></td>
                    <td>${badge}</td>
                    <td>${actions}</td>
                </tr>`;
            });
        });

        bookingTableBody.addEventListener("click", async (e) => {
            const id = e.target.closest("button")?.dataset.id;
            
            // Duyệt đơn
            if (e.target.closest(".btn-approve")) {
                if(confirm("Xác nhận đơn đặt tour này?")) {
                    await updateDoc(doc(db, "bookings", id), { status: "confirmed" });
                }
            }
            // Xóa đơn
            if (e.target.closest(".btn-del-booking")) {
                if(confirm("Xóa vĩnh viễn đơn này?")) {
                    await deleteDoc(doc(db, "bookings", id));
                }
            }
        });
    }

    // ============================================================
    // 4. QUẢN LÝ GÓP Ý (MANAGE-FEEDBACK.HTML)
    // ============================================================
    const feedbackTableBody = document.getElementById("feedbackTableBody");
    if (feedbackTableBody) {
        onSnapshot(collection(db, "feedbacks"), (snap) => {
            feedbackTableBody.innerHTML = "";
            if(snap.empty) {
                document.getElementById("noDataMsg").style.display = "block";
                return;
            } else {
                document.getElementById("noDataMsg").style.display = "none";
            }

            snap.forEach((docSnap) => {
                const f = docSnap.data();
                feedbackTableBody.innerHTML += `
                <tr>
                    <td>${f.createdAt}</td>
                    <td><strong>${f.name}</strong><br><small>${f.email}</small></td>
                    <td>${f.subject}</td>
                    <td>${f.message}</td>
                    <td><button class="btn btn-sm btn-danger btn-del-fb" data-id="${docSnap.id}"><i class="fas fa-trash"></i></button></td>
                </tr>`;
            });
        });
        
        feedbackTableBody.addEventListener("click", async (e) => {
            if(e.target.closest(".btn-del-fb")) {
                const id = e.target.closest(".btn-del-fb").dataset.id;
                if(confirm("Xóa tin nhắn này?")) await deleteDoc(doc(db, "feedbacks", id));
            }
        });
    }

    // ============================================================
    // 5. QUẢN LÝ USER (MANAGE-USER.HTML)
    // Lưu ý: User vẫn dùng LocalStorage vì chưa tích hợp Firebase Auth
    // ============================================================
    const userTableBody = document.getElementById("userTableBody");
    if (userTableBody) {
        function renderUsers() {
            const list = JSON.parse(localStorage.getItem("listUsers")) || [];
            userTableBody.innerHTML = list.map((u, i) => `
                <tr>
                    <td>#${i+1}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.role==='admin'?'<span class="badge bg-danger">Admin</span>':'<span class="badge bg-primary">User</span>'}</td>
                    <td>${u.status==='active'?'<span class="text-success fw-bold">Active</span>':'<span class="text-danger fw-bold">Locked</span>'}</td>
                    <td>${u.role!=='admin' ? `<button class="btn btn-sm ${u.status==='active'?'btn-outline-danger':'btn-outline-success'} btn-status" data-i="${i}"><i class="fas ${u.status==='active'?'fa-lock':'fa-unlock'}"></i></button>` : '-'}</td>
                </tr>`).join('');
        }
        renderUsers();
        
        userTableBody.addEventListener("click", e => {
            const btn = e.target.closest(".btn-status");
            if(btn) {
                const i = btn.dataset.i;
                let list = JSON.parse(localStorage.getItem("listUsers"));
                list[i].status = list[i].status === 'active' ? 'locked' : 'active';
                localStorage.setItem("listUsers", JSON.stringify(list));
                renderUsers();
            }
        });
    }
});
