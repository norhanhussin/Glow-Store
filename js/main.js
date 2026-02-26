/**
 * Glow Store - Core Engine (Integrated Version)
 */

// 1. قاعدة بيانات المنتجات الثابتة (12 منتج)
const defaultProducts = [
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

// 2. إدارة الحالة
let cart = JSON.parse(localStorage.getItem('glow_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('glow_wishlist')) || [];

// دالة لجلب كل المنتجات (الثابتة + الأدمن)
function getAllProducts() {
    const adminProducts = JSON.parse(localStorage.getItem('glow_products')) || [];
    return [...adminProducts, ...defaultProducts];
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateBadges();
    checkOrderStatusUpdates();
});

// 3. عرض المنتجات (تعديل: يستخدم getAllProducts بدلاً من المصفوفة الثابتة)
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const allProducts = getAllProducts();

    grid.innerHTML = allProducts.map((product, index) => {
        const isInWishlist = wishlist.some(item => item.id === product.id);

        return `
        <div class="col-lg-3 col-md-6 col-6 animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.05}s">
            <div class="card h-100 product-card shadow-sm border-0">
                <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
                    <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <div class="img-wrapper">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='./assets/logo.png'">
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

// 4. وظيفة الإضافة للسلة (تعديل: تبحث في كل المنتجات)
function addToCart(id) {
    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const itemInCart = cart.find(item => item.id === id);
    if (itemInCart) {
        itemInCart.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('glow_cart', JSON.stringify(cart));
    updateBadges();

    const cartIcon = document.getElementById('cartIcon');
    if(cartIcon) {
        cartIcon.classList.add('animate__animated', 'animate__rubberBand');
        setTimeout(() => cartIcon.classList.remove('animate__animated', 'animate__rubberBand'), 1000);
    }

    showToast(`تمت إضافة ${product.name} للسلة ✨`);
}

// 5. وظيفة قائمة الأمنيات (تعديل: تبحث في كل المنتجات)
function toggleWishlist(id) {
    const allProducts = getAllProducts();
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

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

// 6. تحديث الأرقام
function updateBadges() {
    const cartCount = document.getElementById('cartCount');
    const wishCount = document.getElementById('wishlistCount');

    if (cartCount) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = total;
    }
    if (wishCount) wishCount.innerText = wishlist.length;
}

// 7. نظام التنبيهات
function showToast(msg) {
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

// 8. نظام متابعة تحديثات الطلب
function checkOrderStatusUpdates() {
    const orders = JSON.parse(localStorage.getItem('glow_orders')) || [];
    const lastKnownStatus = JSON.parse(localStorage.getItem('glow_orders_status_tracker')) || {};

    orders.forEach(order => {
        const orderId = order.id;
        const currentStatus = order.status || 'قيد المراجعة';

        if (lastKnownStatus[orderId] && lastKnownStatus[orderId] !== currentStatus) {
            if (currentStatus === 'تم التأكيد') {
                showOrderNotification(`خبر سعيد! طلبك رقم #${orderId} تم تأكيده وجاري تجهيزه ✨`, 'success');
            } else if (currentStatus === 'تم الرفض') {
                showOrderNotification(`تحديث بخصوص طلبك #${orderId}: للأسف تم رفض الطلب.`, 'danger');
            }
        }
        lastKnownStatus[orderId] = currentStatus;
    });

    localStorage.setItem('glow_orders_status_tracker', JSON.stringify(lastKnownStatus));
}

function showOrderNotification(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `animate__animated animate__fadeInLeft mb-3`;
    const bgColor = type === 'success' ? '#28a745' : '#dc3545';

    toast.innerHTML = `
        <div style="background: ${bgColor}; color: white; padding: 15px 25px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); cursor: pointer; min-width: 300px;" 
             onclick="window.location.href='my-orders.html'">
            <div class="d-flex align-items-center">
                <i class="fas ${type === 'success' ? 'fa-check-double' : 'fa-exclamation-triangle'} fa-lg me-3"></i>
                <div>
                    <strong>تحديث جديد للطلب!</strong><br>
                    <small>${message}</small>
                </div>
            </div>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.replace('animate__fadeInLeft', 'animate__fadeOutLeft');
        setTimeout(() => toast.remove(), 500);
    }, 7000);
}

// 9. كود البحث الذكي
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', function () {
        let filter = this.value.toLowerCase();
        let cards = document.querySelectorAll('#productsGrid > div');

        cards.forEach(card => {
            let title = card.querySelector('h6').innerText.toLowerCase();
            if (title.includes(filter)) {
                card.style.display = "";
                card.classList.add('animate__animated', 'animate__fadeIn');
            } else {
                card.style.display = "none";
            }
        });
    });
}