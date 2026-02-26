/**
 * Glow Store - Admin Dashboard (Final Secure Version)
 */

// 1. حرس بوابة الإدارة - يمنع دخول غير المصرح لهم فوراً
(function adminGuard() {
    // استخدمنا مفتاح واحد فقط للتأمين
    const isAdmin = localStorage.getItem('glow_admin_token'); 
    
    if (isAdmin !== 'true') {
        // لو حاول يدخل الصفحة مباشرة بدون لوجن
        window.location.href = 'admin-login.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    loadAdminOrders();
    setupProductForm();
    calculateStats();
});

// دالة تسجيل الخروج - بتمسح التوكن وبترجع لصفحة اللوجن
function logoutAdmin() {
    Swal.fire({
        title: 'تسجيل الخروج؟',
        text: "هل تريدين الخروج من لوحة التحكم؟",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#651346',
        cancelButtonColor: '#d33',
        confirmButtonText: 'نعم، خروج',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('glow_admin_token');
            window.location.href = 'admin-login.html';
        }
    });
}

// تحديث الإحصائيات بدقة
function calculateStats() {
    const orders = JSON.parse(localStorage.getItem('glow_orders')) || [];
    
    // حساب المبيعات فقط للأوردرات "تم التأكيد"
    const sales = orders
        .filter(o => o.status === 'تم التأكيد')
        .reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);

    const confirmed = orders.filter(o => o.status === 'تم التأكيد').length;
    const pending = orders.filter(o => !o.status || o.status === 'قيد المراجعة').length;

    document.getElementById('stat-total-sales').innerText = sales.toLocaleString() + ' ج.م';
    document.getElementById('stat-confirmed-orders').innerText = confirmed;
    document.getElementById('stat-pending-orders').innerText = pending;
}

// عرض الطلبات في جدول الإدارة
function loadAdminOrders() {
    const list = document.getElementById('adminOrdersList');
    const orders = JSON.parse(localStorage.getItem('glow_orders')) || [];

    if (orders.length === 0) {
        list.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted">لا توجد أوردرات حتى الآن..</td></tr>';
        return;
    }

    list.innerHTML = [...orders].reverse().map(order => {
        let statusClass = 'bg-warning-subtle text-warning border-warning';
        if (order.status === 'تم التأكيد') statusClass = 'bg-success-subtle text-success border-success';
        if (order.status === 'تم الرفض') statusClass = 'bg-danger-subtle text-danger border-danger';

        return `
        <tr class="animate__animated animate__fadeIn">
            <td class="fw-bold">#${order.id}</td>
            <td class="small text-muted">${order.date}</td>
            <td class="fw-bold text-dark">${order.total} ج.م</td>
            <td><span class="badge border px-3 py-2 rounded-pill ${statusClass}">${order.status || 'قيد المراجعة'}</span></td>
            <td>
                <div class="d-flex gap-2">
                    <button title="تأكيد الطلب" class="btn btn-circle btn-success btn-sm shadow-sm" onclick="updateStatus(${order.id}, 'تم التأكيد')"><i class="fas fa-check"></i></button>
                    <button title="رفض الطلب" class="btn btn-circle btn-danger btn-sm shadow-sm" onclick="rejectOrderWithSweet(${order.id})"><i class="fas fa-times"></i></button>
                    <button title="حذف نهائي" class="btn btn-circle btn-outline-dark btn-sm shadow-sm" onclick="deleteOrderWithSweet(${order.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// (باقي الدوال: updateStatus, rejectOrderWithSweet, deleteOrderWithSweet, setupProductForm تظل كما هي لأنها ممتازة)

// تحديث الحالة (قبول)
function updateStatus(id, status) {
    let orders = JSON.parse(localStorage.getItem('glow_orders')) || [];
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index].status = status;
        orders[index].rejectReason = "";
        localStorage.setItem('glow_orders', JSON.stringify(orders));
        
        Swal.fire({
            icon: 'success',
            title: 'تم التأكيد!',
            text: `تم قبول الطلب رقم #${id} بنجاح.`,
            confirmButtonColor: '#651346',
            timer: 2000
        });

        loadAdminOrders();
        calculateStats();
    }
}

// الرفض باستخدام SweetAlert بدل الـ prompt
async function rejectOrderWithSweet(id) {
    const { value: text } = await Swal.fire({
        title: 'سبب الرفض',
        input: 'textarea',
        inputLabel: 'وضحي للعميل سبب رفض الطلب',
        inputPlaceholder: 'مثلاً: المنتج غير متوفر حالياً...',
        inputAttributes: { 'aria-label': 'اكتبي السبب هنا' },
        showCancelButton: true,
        confirmButtonText: 'تأكيد الرفض',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#d33',
        inputValidator: (value) => {
            if (!value) {
                return 'يجب كتابة سبب للرفض!'
            }
        }
    });

    if (text) {
        let orders = JSON.parse(localStorage.getItem('glow_orders')) || [];
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index].status = 'تم الرفض';
            orders[index].rejectReason = text;
            localStorage.setItem('glow_orders', JSON.stringify(orders));
            Swal.fire('تم الرفض', 'تم إرسال سبب الرفض للعميل.', 'info');
            loadAdminOrders();
            calculateStats();
        }
    }
}

// حذف الأوردر بـ SweetAlert
function deleteOrderWithSweet(id) {
    Swal.fire({
        title: 'هل أنتِ متأكدة؟',
        text: "سيتم حذف بيانات الطلب نهائياً ولا يمكن استرجاعها!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2c3e50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'نعم، احذفه',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            let orders = JSON.parse(localStorage.getItem('glow_orders')) || [];
            orders = orders.filter(o => o.id !== id);
            localStorage.setItem('glow_orders', JSON.stringify(orders));
            Swal.fire('تم الحذف!', 'تمت إزالة الطلب من السجل.', 'success');
            loadAdminOrders();
            calculateStats();
        }
    });
}

// إضافة منتج بـ SweetAlert
function setupProductForm() {
    document.getElementById('addProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newProduct = {
            id: Date.now(),
            name: document.getElementById('pName').value,
            price: Number(document.getElementById('pPrice').value),
            image: document.getElementById('pImage').value
        };
        let products = JSON.parse(localStorage.getItem('glow_products')) || [];
        products.push(newProduct);
        localStorage.setItem('glow_products', JSON.stringify(products));
        
        Swal.fire({
            icon: 'success',
            title: 'تم النشر!',
            text: 'المنتج متاح الآن لعملائك في المتجر.',
            confirmButtonColor: '#651346'
        });
        
        e.target.reset();
    });
}