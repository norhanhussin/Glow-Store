/**
 * Glow Store - Profile Logic
 * إدارة بيانات المستخدم، عرض حالة الطلبات، وتسجيل الخروج
 */

document.addEventListener('DOMContentLoaded', () => {
    renderProfileData();
});

// 1. دالة عرض بيانات المستخدم
function renderProfileData() {
    // جلب البيانات من التخزين المحلي
    const userData = JSON.parse(localStorage.getItem('glow_user_data'));
    const isLogged = localStorage.getItem('glow_user_logged');

    // التأكد من أن المستخدم مسجل دخول فعلياً
    if (!userData || isLogged !== 'true') {
        // لو مفيش بيانات، نرجعه لصفحة الدخول فوراً
        window.location.href = "login.html";
        return;
    }

    // ربط العناصر بالـ HTML مع إضافة "القيم الافتراضية" للأمان
    const nameElement = document.getElementById('profileName');
    const emailElement = document.getElementById('profileEmail');
    const infoUsername = document.getElementById('infoUsername');
    const avatarImg = document.getElementById('userAvatar');
    const ordersCount = document.getElementById('infoOrdersCount');

    // توزيع البيانات على العناصر
    if (nameElement) nameElement.innerText = userData.name || "جميلة جلو";
    if (infoUsername) infoUsername.innerText = userData.name || "مستخدم جديد";
    if (emailElement) emailElement.innerText = userData.email || "no-email@glow.com";
    
    // تحديث صورة الأفاتار بشكل تلقائي بناءً على أول حرف من الاسم
    if (avatarImg) {
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=651346&color=fff&size=128`;
    }

    // جلب عدد الطلبات (لو عندك نظام سلة، بنحسب طول مصفوفة الطلبات)
    const myOrders = JSON.parse(localStorage.getItem('glow_orders')) || [];
    if (ordersCount) {
        ordersCount.innerText = myOrders.length > 0 ? `${myOrders.length} طلب` : "لا توجد طلبات بعد";
    }
}

// 2. دالة تسجيل الخروج مع تنبيه بسيط
function logout() {
    // ممكن تضعي هنا سطر تأكيد لو حابة (Confirm)
    if (confirm("هل أنتِ متأكدة من تسجيل الخروج؟")) {
        // مسح حالة تسجيل الدخول فقط (ونترك بيانات المستخدم للمرة القادمة لسهولة الدخول)
        localStorage.setItem('glow_user_logged', 'false');
        
        // التوجيه لصفحة الدخول
        window.location.href = "login.html";
    }
}

// 3. إضافة تأثير بسيط عند تحميل الصفحة (اختياري)
window.onload = () => {
    const card = document.querySelector('.profile-card');
    if(card) {
        card.style.opacity = '1';
    }
};