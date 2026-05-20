// assets/js/ads.js

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. إعدادات الروابط الذكية (Smartlinks)
    // قم بتغيير هذا الرابط إذا أردت استخدام شبكة إعلانية أخرى مستقبلاً
    const SMARTLINK_URL = "https://www.effectivecpmnetwork.com/gnbxmn1n?key=b66f6aefd17df0df522a0e1895945dde";

    // تحديث كل أزرار الـ Smartlink في الموقع تلقائياً
    document.querySelectorAll('.smartlink-btn').forEach(btn => {
        btn.href = SMARTLINK_URL;
        btn.target = "_blank";
        btn.rel = "noopener noreferrer";
    });

    // 2. حقن الإعلانات في الأماكن المخصصة (Ad Placeholders)
    const placeholders = document.querySelectorAll('.ad-placeholder');

    placeholders.forEach(placeholder => {
        const adType = placeholder.getAttribute('data-ad-type');

        if (adType === 'native') {
            // Native Banner
            const script = document.createElement('script');
            script.async = true;
            script.setAttribute('data-cfasync', 'false');
            script.src = 'https://pl29491505.effectivecpmnetwork.com/6b6702a20674280e322984539f666a60/invoke.js';
            
            const div = document.createElement('div');
            div.id = 'container-6b6702a20674280e322984539f666a60';
            
            placeholder.appendChild(script);
            placeholder.appendChild(div);
        } 
        else if (adType === 'social-bar') {
            // Social Bar
            const script = document.createElement('script');
            script.src = 'https://pl29491506.effectivecpmnetwork.com/02/18/5e/02185ef1cc2fbb9b9a81bd1980c88233.js';
            placeholder.appendChild(script);
        }
        else if (adType === 'banner-468') {
            // Banner 468x60
            const script1 = document.createElement('script');
            script1.textContent = `
              atOptions = {
                'key' : 'ecc626b50574cb130ed83a520b0f490f',
                'format' : 'iframe',
                'height' : 60,
                'width' : 468,
                'params' : {}
              };
            `;
            const script2 = document.createElement('script');
            script2.src = 'https://www.highperformanceformat.com/ecc626b50574cb130ed83a520b0f490f/invoke.js';
            
            placeholder.appendChild(script1);
            placeholder.appendChild(script2);
        }
    });
});