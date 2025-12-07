/* =========================================
   ADMIN.JS - GREENTRIP (UPDATED DATA)
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

    const nameEl = document.querySelector(".admin-name");
    if(nameEl) nameEl.innerText = user.name;

    const logBtn = document.getElementById("adminLogoutBtn");
    if(logBtn) logBtn.addEventListener("click", (e) => { 
        e.preventDefault();
        if(confirm("Đăng xuất khỏi hệ thống?")) {
            localStorage.removeItem("currentUser"); 
            window.location.href="../index.html"; 
        }
    });

    // --- KHỞI TẠO DỮ LIỆU MẪU (NẾU CHƯA CÓ TRÊN LOCALSTORAGE ĐỂ TEST) ---
    // Phần này giúp Admin nhìn thấy danh sách 9 tour ngay lập tức nếu không dùng Firebase hoặc khi reset
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
            { id: "T009", name: "Hà Nội Phố Cổ", price: 800000, type: "Thành thị", img: "tour9.jpg" }
        ];
        localStorage.setItem("listTours", JSON.stringify(initialTours));
    }

    // ============================================================
    // 1. DASHBOARD LOGIC
    // ============================================================
    const statTours = document.getElementById("stat-tours");
    if (statTours) {
        onSnapshot(collection(db, "tours"), (snap) => statTours.innerText = snap.size);
        onSnapshot(collection(db, "feedbacks"), (snap) => document.getElementById("stat-feedbacks").innerText = snap.size);
        
        onSnapshot(collection(db, "bookings"), (snap) => {
            let pending = 0;
            snap.forEach(d => { if(d.data().status === 'pending') pending++; });
            document.getElementById("stat-bookings").innerText = pending;
            document.getElementById("stat-customers").innerText = snap.size;
        });

        const recentTable = document.getElementById("recentActivityTable");
        onSnapshot(query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(5)), (snap) => {
            recentTable.innerHTML = "";
            if(snap.empty) recentTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Chưa có hoạt động</td></tr>`;
            else snap.forEach(doc => {
                const b = doc.data();
                const badge = b.status === 'confirmed' ? '<span class="badge bg-success">Đã duyệt</span>' : '<span class="badge bg-warning text-dark">Chờ duyệt</span>';
                recentTable.innerHTML += `<tr><td><small>${b.createdAt}</small></td><td><strong>${b.name}</strong></td><td>${b.tourName}</td><td>${badge}</td></tr>`;
            });
        });
    }

    // ============================================================
    // 2. QUẢN LÝ TOUR (MANAGE-TOUR.HTML) - Dùng LocalStorage để đồng bộ với danh sách 9 tour
    // ============================================================
    const tourTableBody = document.getElementById("tourTableBody");
    const btnSaveTour = document.getElementById("btnSaveTour");
    const btnOpenAddModal = document.getElementById("btnOpenAddModal");
    let tourModal;
    if(document.getElementById('tourModal')) tourModal = new bootstrap.Modal(document.getElementById('tourModal'));

    if (tourTableBody) {
        function renderTours() {
            // Lấy từ LocalStorage để hiển thị đúng 9 tour bạn vừa tạo
            const list = JSON.parse(localStorage.getItem("listTours")) || [];
            tourTableBody.innerHTML = list.map(t => {
                // Xử lý ảnh: Nếu là tên file thì thêm đường dẫn
                let imgSrc = t.img.startsWith("http") ? t.img : `../assets/img/${t.img}`;
                return `
                <tr>
                    <td>${t.id}</td>
                    <td><img src="${imgSrc}" width="60" class="rounded" onerror="this.src='https://via.placeholder.com/60'"></td>
                    <td>${t.name}</td>
                    <td>${new Intl.NumberFormat('vi-VN').format(t.price)} đ</td>
                    <td>${t.type}</td>
                    <td>
                        <button class="btn btn-sm btn-danger btn-del-tour" data-id="${t.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            }).join('');
        }
        renderTours();

        // Xóa Tour
        tourTableBody.addEventListener("click", (e) => {
            if(e.target.closest(".btn-del-tour")) {
                if(confirm("Xóa tour này?")) {
                    const id = e.target.closest(".btn-del-tour").dataset.id;
                    let list = JSON.parse(localStorage.getItem("listTours"));
                    list = list.filter(t => t.id !== id);
                    localStorage.setItem("listTours", JSON.stringify(list));
                    renderTours();
                }
            }
        });

        // Thêm Tour Mới
        if(btnSaveTour) btnSaveTour.addEventListener("click", () => {
            const name = document.getElementById("tourName").value;
            const price = document.getElementById("tourPrice").value;
            const type = document.getElementById("tourType").value;
            let img = document.getElementById("tourImg").value || "tour1.jpg";

            let list = JSON.parse(localStorage.getItem("listTours")) || [];
            list.push({ id: "T" + Date.now(), name, price, type, img });
            localStorage.setItem("listTours", JSON.stringify(list));
            
            alert("Thêm tour thành công!");
            renderTours();
            tourModal.hide();
        });

        if(btnOpenAddModal) btnOpenAddModal.addEventListener("click", () => {
            document.getElementById("tourForm").reset();
            tourModal.show();
        });
    }

    // ============================================================
    // 3. QUẢN LÝ BOOKING (FIREBASE)
    // ============================================================
    const bookingTableBody = document.querySelector("#bookingTable tbody"); 
    if (bookingTableBody) {
        onSnapshot(query(collection(db, "bookings"), orderBy("createdAt", "desc")), (snap) => {
            bookingTableBody.innerHTML = "";
            snap.forEach((docSnap) => {
                const b = docSnap.data();
                const isConfirmed = b.status === 'confirmed';
                bookingTableBody.innerHTML += `
                <tr>
                    <td>${b.createdAt}</td>
                    <td><strong>${b.name}</strong><br><small>${b.phone}</small></td>
                    <td>${b.tourName}<br><small>${b.people} khách</small></td>
                    <td>${isConfirmed ? '<span class="badge bg-success">Đã duyệt</span>' : '<span class="badge bg-warning text-dark">Chờ duyệt</span>'}</td>
                    <td>
                        ${!isConfirmed ? `<button class="btn btn-sm btn-success btn-approve me-1" data-id="${docSnap.id}"><i class="fas fa-check"></i></button>` : ''}
                        <button class="btn btn-sm btn-danger btn-del-booking" data-id="${docSnap.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        });

        bookingTableBody.addEventListener("click", async (e) => {
            const id = e.target.closest("button")?.dataset.id;
            if (e.target.closest(".btn-approve")) await updateDoc(doc(db, "bookings", id), { status: "confirmed" });
            if (e.target.closest(".btn-del-booking") && confirm("Xóa đơn này?")) await deleteDoc(doc(db, "bookings", id));
        });
    }

    // ============================================================
    // 4. QUẢN LÝ GÓP Ý
    // ============================================================
    const fbTable = document.getElementById("feedbackTableBody");
    if(fbTable) {
        onSnapshot(collection(db, "feedbacks"), (snap) => {
            fbTable.innerHTML = "";
            document.getElementById("noDataMsg").style.display = snap.empty ? "block" : "none";
            snap.forEach((docSnap) => {
                const f = docSnap.data();
                fbTable.innerHTML += `<tr><td>${f.createdAt}</td><td>${f.name}<br><small>${f.email}</small></td><td>${f.subject}</td><td>${f.message}</td><td><button class="btn btn-sm btn-danger btn-del-fb" data-id="${docSnap.id}"><i class="fas fa-trash"></i></button></td></tr>`;
            });
        });
        fbTable.addEventListener("click", async (e) => {
            if(e.target.closest(".btn-del-fb") && confirm("Xóa tin nhắn?")) {
                await deleteDoc(doc(db, "feedbacks", e.target.closest(".btn-del-fb").dataset.id));
            }
        });
    }

    // ============================================================
    // 5. QUẢN LÝ USER
    // ============================================================
    const userTable = document.getElementById("userTableBody");
    if (userTable) {
        function renderUsers() {
            const list = JSON.parse(localStorage.getItem("listUsers")) || [];
            userTable.innerHTML = list.map((u, i) => `<tr><td>#${i+1}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role==='admin'?'<span class="badge bg-danger">Admin</span>':'<span class="badge bg-primary">User</span>'}</td><td>${u.status==='active'?'<span class="text-success">Active</span>':'<span class="text-danger">Locked</span>'}</td><td>${u.role!=='admin' ? `<button class="btn btn-sm ${u.status==='active'?'btn-outline-danger':'btn-outline-success'} btn-status" data-i="${i}"><i class="fas ${u.status==='active'?'fa-lock':'fa-unlock'}"></i></button>` : '-'}</td></tr>`).join('');
        }
        renderUsers();
        userTable.addEventListener("click", e => {
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
