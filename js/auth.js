/**
 * Glow Store - Unified Auth System
 * نظام الدخول الموحد: (مستخدم عادي & أدمن)
 */

document.addEventListener('DOMContentLoaded', () => {
    const allInputs = document.querySelectorAll('.form-control');
    allInputs.forEach(input => {
        // فحص الحقل بمجرد خروج الماوس منه
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        // مسح الخطأ فوراً عند بداية الكتابة
        input.addEventListener('input', () => {
            clearError(input);
        });
    });
});

// 1. وظيفة التحقق الفوري وإظهار الرسائل النصية
function validateField(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errorMessage = "";

    if (input.type === 'email' && input.value !== "") {
        if (!emailRegex.test(input.value.trim())) {
            errorMessage = "عذراً، صيغة البريد الإلكتروني غير صحيحة";
        }
    } 
    else if (input.type === 'password' && input.value !== "") {
        if (input.value.length < 6) {
            errorMessage = "يجب أن تكون كلمة المرور 6 رموز على الأقل";
        }
    }
    else if (input.id === 'regName' && input.value !== "") {
        if (input.value.trim().length < 3) {
            errorMessage = "من فضلكِ اكتبي اسمكِ الكامل (3 حروف فأكثر)";
        }
    }

    if (errorMessage !== "") {
        showFieldError(input, errorMessage);
        return false;
    } else {
        clearError(input);
        return true;
    }
}

// 2. إظهار الخطأ تحت الحقل
function showFieldError(input, msg) {
    clearError(input);
    input.style.borderBottom = "2px solid #ff4d4d";
    
    const errorSpan = document.createElement('small');
    errorSpan.className = "field-error-msg animate__animated animate__fadeIn";
    errorSpan.style.cssText = "color: #ff4d4d; font-size: 0.75rem; display: block; margin-top: 5px; text-align: right; font-weight: bold;";
    errorSpan.innerText = msg;
    
    input.parentElement.appendChild(errorSpan);
}

// 3. مسح الخطأ
function clearError(input) {
    input.style.borderBottom = "2px solid #eee";
    const existingMsg = input.parentElement.querySelector('.field-error-msg');
    if (existingMsg) {
        existingMsg.remove();
    }
}

// 4. التبديل بين فورم الدخول والتسجيل
function showForm(type) {
    const loginSec = document.getElementById('loginSection');
    const registerSec = document.getElementById('registerSection');
    const tabLog = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');

    if (type === 'login') {
        registerSec.style.display = 'none';
        loginSec.style.display = 'block';
        tabLog.classList.add('active');
        tabReg.classList.remove('active');
    } else {
        loginSec.style.display = 'none';
        registerSec.style.display = 'block';
        tabReg.classList.add('active');
        tabLog.classList.remove('active');
    }
}

// 5. معالجة إنشاء حساب جديد
function handleRegister() {
    const nameInput = document.getElementById('regName');
    const emailInput = document.getElementById('regEmail');
    const passInput = document.getElementById('regPass');

    const isNameOk = validateField(nameInput);
    const isEmailOk = validateField(emailInput);
    const isPassOk = validateField(passInput);

    if (!isNameOk || !isEmailOk || !isPassOk || !nameInput.value || !emailInput.value || !passInput.value) {
        showToast("يرجى التأكد من ملء البيانات بشكل صحيح 🌸", "exclamation-circle");
        return;
    }

    const userData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        pass: passInput.value
    };

    localStorage.setItem('glow_user_data', JSON.stringify(userData));
    localStorage.setItem('glow_user_logged', 'true');
    localStorage.removeItem('glow_admin_token'); // ضمان أنه ليس أدمن

    showToast("تم إنشاء حسابكِ بنجاح! نورتينا ✨", "check-circle");
    setTimeout(() => window.location.href = "index.html", 2000);
}

// 6. معالجة تسجيل الدخول (المنطق الجديد للأدمن)
function handleLogin() {
    const emailInput = document.getElementById('logEmail');
    const passInput = document.getElementById('logPass');
    
    // بيانات الأدمن الثابتة
    const adminCredentials = {
        email: "admin@glow.com",
        pass: "glow123"
    };

    const savedData = JSON.parse(localStorage.getItem('glow_user_data'));

    if (!validateField(emailInput) || !validateField(passInput) || !emailInput.value || !passInput.value) {
        showToast("تأكدي من إدخال البيانات المطلوبة", "info-circle");
        return;
    }

    const inputEmail = emailInput.value.trim();
    const inputPass = passInput.value;

    // حالة 1: الدخول كأدمن
    if (inputEmail === adminCredentials.email && inputPass === adminCredentials.pass) {
        localStorage.setItem('glow_admin_token', 'true');
        localStorage.setItem('glow_user_logged', 'true');
        
        showToast("أهلاً بكِ في لوحة الإدارة.. جاري التحميل 🛠️", "user-shield");
        setTimeout(() => window.location.href = "admin.html", 1500);
    } 
    // حالة 2: الدخول كمستخدم عادي
    else if (savedData && savedData.email === inputEmail && savedData.pass === inputPass) {
        localStorage.setItem('glow_user_logged', 'true');
        localStorage.removeItem('glow_admin_token');
        
        showToast("أهلاً بعودتكِ يا جميلة! ❤️", "heart");
        setTimeout(() => window.location.href = "index.html", 1500);
    } 
    // حالة 3: بيانات خاطئة
    else {
        showToast("عذراً، البيانات غير متطابقة ❌", "exclamation-triangle");
        showFieldError(emailInput, "تأكدي من البريد");
        showFieldError(passInput, "أو كلمة المرور");
    }
}

// 7. نظام التنبيهات (Toast Notification)
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
        background: #651346; color: white; padding: 15px 25px; border-radius: 50px;
        margin-bottom: 10px; box-shadow: 0 10px 30px rgba(101, 19, 70, 0.3);
        display: flex; align-items: center; gap: 12px; min-width: 300px;
        font-family: 'Cairo', sans-serif; direction: rtl;
    `;

    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('animate__slideInLeft', 'animate__fadeOutLeft');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}