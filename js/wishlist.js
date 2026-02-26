document.addEventListener('DOMContentLoaded', () => {
    renderFullWishlist();
});

// 1. عرض المنتجات
function renderFullWishlist() {
    const grid = document.getElementById('wishlistGrid');
    const wishCount = document.getElementById('wishCount');
    let wishlist = JSON.parse(localStorage.getItem('glow_wishlist')) || [];

    wishCount.innerText = `${wishlist.length} منتجات`;

    if (wishlist.length === 0) {
        grid.innerHTML = `
            <div class="empty-wishlist animate__animated animate__fadeIn">
                <i class="far fa-heart fa-4x text-muted mb-3"></i>
                <h5>قائمة أمنياتك فارغة</h5>
                <p class="text-muted">المنتجات التي تعجبك ستظهر هنا</p>
                <a href="index.html" class="btn btn-gold rounded-pill mt-2">استكشفي المنتجات</a>
            </div>`;
        return;
    }

    grid.innerHTML = wishlist.map(item => `
        <div class="col-6 col-md-4 col-lg-3 animate__animated animate__fadeIn">
            <div class="wish-card shadow-sm">
                <button class="remove-wish" onclick="removeFromWishlist(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${item.image}" class="wish-img" alt="${item.name}">
                <div class="p-3 text-center">
                    <h6 class="fw-bold mb-1">${item.name}</h6>
                    <p class="text-danger small mb-3">${item.price} ج.م</p>
                    <button class="btn btn-add-cart w-100" onclick="moveToCart(${item.id})">
                        <i class="fas fa-cart-plus me-1"></i> أضيفي للسلة
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 2. حذف من قائمة الأمنيات
function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('glow_wishlist')) || [];
    wishlist = wishlist.filter(item => item.id !== id);
    localStorage.setItem('glow_wishlist', JSON.stringify(wishlist));
    renderFullWishlist();
    showToast("تم الحذف من قائمة الأمنيات", "trash");
}

// 3. نقل المنتج للسلة
function moveToCart(id) {
    let wishlist = JSON.parse(localStorage.getItem('glow_wishlist')) || [];
    let cart = JSON.parse(localStorage.getItem('glow_cart')) || [];
    
    const product = wishlist.find(item => item.id === id);
    
    if (product) {
        // فحص لو المنتج موجود فعلاً في السلة
        const inCart = cart.find(c => c.id === id);
        if (inCart) {
            inCart.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('glow_cart', JSON.stringify(cart));
        showToast("تمت الإضافة للسلة بنجاح 🎉", "check");
        
        // لو حابة تحذفيه من الـ Wishlist بعد الإضافة للسلة (اختياري)
        // removeFromWishlist(id); 
    }
}

// دالة التنبيهات (لو مش موجودة في main.js)
function showToast(message, icon) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'custom-toast'; // تأكدي من وجود التنسيق في CSS
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}