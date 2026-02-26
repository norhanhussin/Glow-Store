/**
 * Glow Store - Cart System (Classic Toast Version)
 * النسخة المعتمدة والمؤمنة
 */

document.addEventListener('DOMContentLoaded', () => {
    renderFullCart();
    setupPaymentListeners();
});

// 1. نظام التنبيهات الأنيق
function showToast(message, icon = 'check-circle') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = "position: fixed; top: 20px; left: 20px; z-index: 10000;";
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast animate__animated animate__slideInLeft';
    
    toast.style.cssText = `
        background: #651346; color: white; padding: 12px 25px; border-radius: 50px;
        margin-bottom: 10px; box-shadow: 0 10px 30px rgba(101, 19, 70, 0.3);
        display: flex; align-items: center; gap: 12px; min-width: 280px;
        font-family: 'Cairo', sans-serif; direction: rtl;
    `;

    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('animate__slideInLeft', 'animate__fadeOutLeft');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 2. عرض محتويات السلة وتحديث الإجمالي
function renderFullCart() {
    const container = document.getElementById('cartContainer');
    const subTotalElem = document.getElementById('subTotal');
    const finalTotalElem = document.getElementById('finalTotal');
    let cart = JSON.parse(localStorage.getItem('glow_cart')) || [];
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 animate__animated animate__fadeIn">
                <i class="fas fa-shopping-basket fa-4x text-muted mb-3 opacity-25"></i>
                <p class="text-muted fs-5">حقيبة التسوق فارغة حالياً..</p>
                <a href="index.html" class="btn btn-outline-dark rounded-pill">ابدئي التسوق الآن</a>
            </div>`;
        if(subTotalElem) subTotalElem.innerText = "0 ج.م";
        if(finalTotalElem) finalTotalElem.innerText = "0 ج.م";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item) => {
        const itemTotal = Number(item.price) * Number(item.quantity);
        total += itemTotal;
        return `
        <div class="cart-card animate__animated animate__fadeIn mb-3 p-3 border rounded-3 bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div class="product-info d-flex align-items-center">
                <img src="${item.image}" class="cart-img" style="width: 70px; height: 70px; object-fit: contain; border-radius: 10px; margin-left: 15px;">
                <div>
                    <h6 class="fw-bold mb-1">${item.name}</h6>
                    <small class="text-muted d-block">${item.price} ج.م</small>
                    <button class="btn btn-sm text-danger p-0 mt-1" onclick="removeItem(${item.id})">
                        <i class="fas fa-trash-alt me-1"></i> حذف
                    </button>
                </div>
            </div>
            <div class="d-flex flex-column align-items-end">
                <div class="qty-box mb-2 d-flex align-items-center bg-light rounded-pill px-2">
                    <button class="btn btn-sm" onclick="changeQty(${item.id}, -1)">-</button>
                    <span class="mx-3 fw-bold">${item.quantity}</span>
                    <button class="btn btn-sm" onclick="changeQty(${item.id}, 1)">+</button>
                </div>
                <div class="fw-bold text-dark">${itemTotal} ج.م</div>
            </div>
        </div>`;
    }).join('');

    if(subTotalElem) subTotalElem.innerText = `${total} ج.م`;
    if(finalTotalElem) finalTotalElem.innerText = `${total} ج.م`;
}

// 3. تغيير الكمية والحذف
function changeQty(id, delta) {
    let cart = JSON.parse(localStorage.getItem('glow_cart')) || [];
    const item = cart.find(p => p.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeItem(id);
        } else {
            localStorage.setItem('glow_cart', JSON.stringify(cart));
            renderFullCart();
        }
    }
}

function removeItem(id) {
    let cart = JSON.parse(localStorage.getItem('glow_cart')) || [];
    cart = cart.filter(p => p.id !== id);
    localStorage.setItem('glow_cart', JSON.stringify(cart));
    renderFullCart();
    showToast("تم حذف المنتج من السلة", "trash-alt");
}

// 4. إدارة طرق الدفع (PayPal vs COD)
function setupPaymentListeners() {
    const radios = document.querySelectorAll('input[name="paymentMethod"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const paypalBtnContainer = document.getElementById('paypal-button-container');
            const mainCheckoutBtn = document.getElementById('checkoutBtn');
            
            if (e.target.value === 'paypal') {
                paypalBtnContainer.classList.remove('d-none');
                mainCheckoutBtn.classList.add('d-none');
                initPayPalButton();
            } else {
                paypalBtnContainer.classList.add('d-none');
                mainCheckoutBtn.classList.remove('d-none');
            }
        });
    });
}

function initPayPalButton() {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';
    
    // جلب الإجمالي وتحويله لدولار افتراضياً (لأجل الاختبار)
    let totalText = document.getElementById('finalTotal').innerText;
    let totalEGP = parseFloat(totalText.replace(/[^\d.]/g, '')) || 0;
    let totalUSD = (totalEGP / 50).toFixed(2); 

    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            style: { layout: 'vertical', color: 'gold', shape: 'pill' },
            createOrder: function(data, actions) {
                return actions.order.create({ purchase_units: [{ amount: { value: totalUSD } }] });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    processOrder('بطاقة بنكية (PayPal/VISA)');
                });
            }
        }).render('#paypal-button-container');
    }
}

// 5. تأكيد الطلب وحفظه في السجل
function handleCheckout() {
    const isLoggedIn = localStorage.getItem('glow_user_logged');
    if (!isLoggedIn) {
        showToast("يرجى تسجيل الدخول أولاً لإتمام طلبك ✨", "exclamation-circle");
        setTimeout(() => { window.location.href = "login.html"; }, 1500);
        return;
    }
    processOrder('دفع عند الاستلام');
}

function processOrder(method) {
    let cart = JSON.parse(localStorage.getItem('glow_cart')) || [];
    if (cart.length === 0) {
        showToast("السلة فارغة!", "exclamation-circle");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

    const newOrder = {
        id: Math.floor(Math.random() * 90000) + 10000,
        date: new Date().toLocaleDateString('ar-EG'),
        total: total,
        items: cart,
        method: method,
        status: 'قيد المراجعة'
    };

    // حفظ في سجل طلبات الأدمن والعميل
    let orders = JSON.parse(localStorage.getItem('glow_orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('glow_orders', JSON.stringify(orders));

    // تفريغ السلة
    localStorage.removeItem('glow_cart');

    showToast(`شكراً لكِ! تم تسجيل طلبك بنجاح 🎉`, "check-circle");
    setTimeout(() => { window.location.href = "my-orders.html"; }, 2000);
}