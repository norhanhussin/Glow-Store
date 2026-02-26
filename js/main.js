/**
 * Glow Store - Core Engine (Updated with more products)
 */

// 1. قاعدة بيانات المنتجات (تمت زيادة المنتجات إلى 12)
const products = [
    { id: 1, name: "طوق الورد الملكي", price: 120, image: "./assets/img1.avif" },
    { id: 2, name: "طقم توك لؤلؤ ناعم", price: 65, image: "./assets/img2.avif" },
    { id: 3, name: "إكسسوار متدلي ذهبي", price: 180, image: "./assets/img3.avif" },
    { id: 4, name: "مجموعة مشابك سهرة", price: 95, image: "./assets/img4.avif" },
    { id: 5, name: "بندانا ستان فاخرة", price: 45, image: "./assets/img5.avif" },
    { id: 6, name: "خاتم كريستال لامع", price: 150, image: "./assets/img6.avif" },
    { id: 7, name: "سلسال الجوهرة الوردي", price: 210, image: "./assets/img1.avif" },
    { id: 8, name: "طوق القماش المخملي", price: 55, image: "./assets/img2.avif" },
    { id: 9, name: "دبوس شعر فراشة", price: 30, image: "./assets/img3.avif" },
    { id: 10, name: "طقم خواتم بوهيمي", price: 110, image: "./assets/img4.avif" },
    { id: 11, name: "خلخال ناعم بسيط", price: 85, image: "./assets/img5.avif" },
    { id: 12, name: "مشط شعر مزخرف", price: 70, image: "./assets/img6.avif" }
];

// 2. إدارة الحالة (السلة والمفضلة)
let cart = JSON.parse(localStorage.getItem('glow_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('glow_wishlist')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateBadges();
});

// 3. عرض المنتجات في الصفحة بتصميم متناسق
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = products.map((product, index) => {
        const isInWishlist = wishlist.some(item => item.id === product.id);
        
        return `
        <div class="col-lg-3 col-md-6 col-6 animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.05}s">
            <div class="card h-100 product-card shadow-sm border-0">
                <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
                    <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <div class="img-wrapper">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="card-body text-center p-3">
                    <h6 class="fw-bold mb-1" style="font-size: 0.95rem;">${product.name}</h6>
                    <p class="text-secondary fw-bold mb-3">${product.price} ج.م</p>
                    <button onclick="addToCart(${product.id})" class="btn btn-glow w-100 p-2">
                        <i class="fas fa-shopping-cart me-1"></i> إضافة
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// 4. وظيفة الإضافة للسلة مع تأثير بصري
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const itemInCart = cart.find(item => item.id === id);

    if (itemInCart) {
        itemInCart.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('glow_cart', JSON.stringify(cart));
    updateBadges();
    
    const cartIcon = document.getElementById('cartIcon');
    cartIcon.classList.add('animate__animated', 'animate__rubberBand');
    setTimeout(() => cartIcon.classList.remove('animate__animated', 'animate__rubberBand'), 1000);

    showToast(`تمت إضافة ${product.name} للسلة ✨`);
}

// 5. وظيفة قائمة الأمنيات
function toggleWishlist(id) {
    const product = products.find(p => p.id === id);
    const index = wishlist.findIndex(item => item.id === id);

    if (index === -1) {
        wishlist.push(product);
        showToast("تمت الإضافة للمفضلة ❤️");
    } else {
        wishlist.splice(index, 1);
        showToast("تمت الإزالة من المفضلة");
    }

    localStorage.setItem('glow_wishlist', JSON.stringify(wishlist));
    updateBadges();
    renderProducts();
}

// 6. تحديث الأرقام في الهيدر
function updateBadges() {
    const cartCount = document.getElementById('cartCount');
    const wishCount = document.getElementById('wishlistCount');
    
    if (cartCount) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = total;
    }
    if (wishCount) wishCount.innerText = wishlist.length;
}

// 7. نظام التنبيهات الجميل
function showToast(msg) {
    // إزالة التنبيهات القديمة إذا وجدت
    const oldToast = document.querySelector('.custom-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-toast animate__animated animate__fadeInUp';
    toast.innerHTML = `<i class="fas fa-check-circle me-2"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('animate__fadeInUp', 'animate__fadeOutDown');
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

/**
 * Glow Store - Smart Notifications System
 * بيراقب لو الأدمن غير حالة الأوردر وبيطلع رسالة لليوزر
 */

document.addEventListener('DOMContentLoaded', () => {
    checkOrderStatusUpdates();
});

function checkOrderStatusUpdates() {
    // 1. جلب الطلبات الحالية
    const orders = JSON.parse(localStorage.getItem('glow_orders')) || [];
    
    // 2. جلب "آخر حالة معروفة" مخزنة عند العميل
    // ده مفتاح هنخزن فيه الحالات عشان نعرف لو فيه جديد حصل
    const lastKnownStatus = JSON.parse(localStorage.getItem('glow_orders_status_tracker')) || {};

    let hasUpdates = false;

    orders.forEach(order => {
        const orderId = order.id;
        const currentStatus = order.status || 'قيد المراجعة';

        // 3. المقارنة: لو الحالة الحالية مختلفة عن اللي اليوزر شافها قبل كده
        if (lastKnownStatus[orderId] && lastKnownStatus[orderId] !== currentStatus) {
            
            if (currentStatus === 'تم التأكيد') {
                showOrderNotification(`خبر سعيد! طلبك رقم #${orderId} تم تأكيده وجاري تجهيزه ✨`, 'success');
            } 
            else if (currentStatus === 'تم الرفض') {
                showOrderNotification(`تحديث بخصوص طلبك #${orderId}: للأسف تم رفض الطلب. اضغطي لمشاهدة السبب.`, 'danger');
            }
            
            hasUpdates = true;
        }

        // تحديث الحالة في المتعقب
        lastKnownStatus[orderId] = currentStatus;
    });

    // 4. حفظ الحالات الجديدة عشان الإشعار ميظهرش تاني لنفس الأوردر
    localStorage.setItem('glow_orders_status_tracker', JSON.stringify(lastKnownStatus));
}

// دالة إظهار الإشعار بشكل جمالي (Toast)
function showOrderNotification(message, type) {
    const notificationContainer = document.getElementById('toast-container');
    if (!notificationContainer) return;

    const toast = document.createElement('div');
    toast.className = `animate__animated animate__fadeInLeft mb-3`;
    
    // تنسيق الإشعار
    const bgColor = type === 'success' ? '#28a745' : '#dc3545';
    
    toast.innerHTML = `
        <div style="background: ${bgColor}; color: white; padding: 15px 25px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); cursor: pointer; min-width: 300px;" 
             onclick="window.location.href='my-orders.html'">
            <div class="d-flex align-items-center">
                <div class="me-3">
                    <i class="fas ${type === 'success' ? 'fa-check-double' : 'fa-exclamation-triangle'} fa-lg"></i>
                </div>
                <div>
                    <strong class="d-block">تحديث جديد للطلب!</strong>
                    <small>${message}</small>
                </div>
            </div>
        </div>
    `;

    notificationContainer.appendChild(toast);

    // حذف الإشعار بعد 7 ثواني
    setTimeout(() => {
        toast.classList.replace('animate__fadeInLeft', 'animate__fadeOutLeft');
        setTimeout(() => toast.remove(), 500);
    }, 7000);
}