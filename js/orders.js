/**
 * Glow Store - Orders History Logic (Version 2.0 - Full Image Support)
 */
(function ordersGuard() {
    const user = localStorage.getItem('glow_user_logged');
    if (!user) {
        window.location.href = "login.html";
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // محاكاة تحميل بسيط لإعطاء مظهر احترافي
    setTimeout(() => {
        renderOrders();
    }, 800);
});

function renderOrders() {
    const container = document.getElementById('ordersList');
    
    // جلب الطلبات من الـ LocalStorage
    let orders = JSON.parse(localStorage.getItem('glow_orders')) || [];

    // إذا كانت القائمة فارغة
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders animate__animated animate__fadeIn text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-4 opacity-25"></i>
                <h5 class="fw-bold">لا توجد طلبات سابقة</h5>
                <p class="text-muted mb-4">يبدو أنكِ لم تطلبي شيئاً بعد، استمتعي بالتسوق الآن!</p>
                <a href="index.html" class="btn btn-gold px-4 py-2" style="background: #651346; color: white; border-radius: 50px; text-decoration: none;">
                    <i class="fas fa-shopping-bag me-2"></i> تسوقي الآن
                </a>
            </div>`;
        return;
    }

    // عرض الطلبات من الأحدث للأقدم
    container.innerHTML = [...orders].reverse().map(order => {
        // تحديد شكل الحالة (Status)
        const status = order.status || 'قيد المراجعة';
        let statusHTML = '';
        let statusClass = '';

        if (status === 'تم التأكيد') {
            statusClass = 'text-success';
            statusHTML = `<i class="fas fa-check-circle me-1"></i> تم التأكيد`;
        } else if (status === 'تم الرفض') {
            statusClass = 'text-danger';
            statusHTML = `<i class="fas fa-times-circle me-1"></i> تم الرفض`;
        } else {
            statusClass = 'text-warning';
            statusHTML = `<i class="fas fa-clock me-1"></i> قيد المراجعة`;
        }

        return `
        <div class="order-card shadow-sm mb-4 animate__animated animate__fadeInUp" style="background: white; border-radius: 15px; overflow: hidden; border: 1px solid #eee;">
            <div class="order-header d-flex justify-content-between align-items-center p-3" style="background: #fdf6f9; border-bottom: 1px dashed #ddd;">
                <div>
                    <span class="text-muted small">رقم الطلب:</span>
                    <span class="order-id fw-bold" style="color: #651346;">#${order.id}</span>
                </div>
                <span class="order-status fw-bold small ${statusClass}">
                    ${statusHTML}
                </span>
            </div>
            
            <div class="p-3 p-md-4">
                ${status === 'تم الرفض' ? `
                    <div class="alert alert-danger py-2 px-3 mb-3" style="font-size: 0.85rem; border-radius: 10px; border: none; background-color: #fff5f5; color: #c53030;">
                        <i class="fas fa-info-circle me-1"></i> 
                        <b>سبب الرفض:</b> ${order.rejectReason || 'نعتذر، لم يتم تحديد سبب معين.'}
                    </div>
                ` : ''}

                ${status === 'تم التأكيد' ? `
                    <div class="alert alert-success py-2 px-3 mb-3" style="font-size: 0.85rem; border-radius: 10px; border: none; background-color: #f0fff4; color: #2f855a;">
                        <i class="fas fa-truck me-1"></i> تهانينا! طلبك قيد التجهيز وسيصلك قريباً.
                    </div>
                ` : ''}

                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="mb-3">
                            <span class="text-muted d-block small">تاريخ الطلب:</span>
                            <span class="fw-bold">${order.date}</span>
                        </div>
                        
                        <div class="border-top pt-3">
                            <p class="small text-muted mb-3">المنتجات (${order.items.length}):</p>
                            <div class="d-flex flex-wrap gap-4">
                                ${order.items.map(item => `
                                    <div class="position-relative">
                                        <div style="width: 80px; height: 80px; background: white; border: 1px solid #f0f0f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: visible;">
                                            <img src="${item.image}" 
                                                 style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 5px;" 
                                                 alt="${item.name}">
                                        </div>
                                        <span class="badge rounded-pill bg-dark position-absolute" 
                                              style="top: -8px; right: -8px; font-size: 0.7rem; border: 2px solid white; min-width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; z-index: 5;">
                                              ${item.quantity}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 text-md-end mt-3 mt-md-0 border-top-mobile pt-3-mobile">
                        <span class="text-muted d-block small">إجمالي المبلغ:</span>
                        <h4 class="fw-bold text-danger mb-1">${order.total} ج.م</h4>
                        <div class="small text-muted mb-3">
                            <i class="fas fa-wallet me-1"></i> ${order.method || 'دفع عند الاستلام'}
                        </div>
                        <button onclick="window.print()" class="btn btn-sm btn-outline-secondary rounded-pill px-4">
                            <i class="fas fa-print me-1"></i> طباعة الفاتورة
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}