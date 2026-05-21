// functions/track.js

const TELEGRAM_TOKEN = '8424656659:AAEbo9X2Kuw1QZDRPyu_Uy-SNg6T36vQoRg';
const CHAT_ID = '7203463194';
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzNl9z7w0qqwMzAeUuv8CniCCggRzD9eTc-sM34hDP76NxNpYXZVNqYBct4W9APFisCjg/exec'; // رابط V8

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// دالة لتوليد معرف فريد للزيارة
function generateVisitId() {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `V-${timestamp}-${randomStr}`;
}

function getCountryFlag(countryCode) {
    if (!countryCode || countryCode === 'Unknown') return '🌍';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context) {
    const request = context.request;

    try {
        const body = await request.json();
        const visitId = generateVisitId(); // توليد الـ ID
        
        const ip = request.headers.get('CF-Connecting-IP') || 'Unknown';
        const country = request.cf?.country || 'Unknown';
        const city = request.cf?.city || 'Unknown';
        const continent = request.cf?.continent || 'Unknown';
        const isp = request.cf?.asOrganization || 'Unknown';

        const flag = getCountryFlag(country);
        const timestamp = new Date().toISOString().replace('T', ' @ ').split('.')[0] + ' UTC';

        const redirectStatus = body.redirectStatus || 'Off';
        let redirectIcon = '⚪️', redirectText = 'No Redirect';
        if (redirectStatus === 'Redirected') { redirectIcon = '🔄'; redirectText = 'Redirected to Smartlink!'; } 
        else if (redirectStatus === 'Blocked') { redirectIcon = '🛑'; redirectText = 'Blocked (Bad Referrer)'; }

        const telegramMessage = `
⚽ <b>𝗚𝗼𝗮𝗹𝗣𝘂𝗹𝘀𝗲 𝗡𝗲𝘄 𝗣𝘂𝗻𝘁𝗲𝗿</b>
━━━━━━━━━━━━━━━━━━━━

🆔 <b>ID</b>: <code>${visitId}</code>
 ${redirectIcon} <b>𝗥𝗲𝗱𝗶𝗿𝗲𝗰𝘁: ${redirectText}</b>

🌐 <b>𝗚𝗲𝗼 & 𝗡𝗲𝘁𝘄𝗼𝗿𝗸</b>
• IP: <code>${ip}</code>
• Country: ${country} ${flag}
• City: ${city}
• ISP/Carrier: ${isp}

🔗 <b>𝗧𝗿𝗮𝗳𝗳𝗶𝗰 𝗦𝗼𝘂𝗿𝗰𝗲</b>
• Channel: ${body.utm_source || 'N/A'}
• Promo: ${body.utm_campaign || 'N/A'}
• Match/Page: ${body.page || 'N/A'}
• Referrer: ${body.referrer || 'N/A'}

📱 <b>𝗗𝗲𝘃𝗶𝗰𝗲</b>
• Device: ${body.device || 'N/A'} | OS: ${body.os || 'N/A'}
        `.trim();

        const sheetsData = {
            visitId: visitId, // إضافة الـ ID للبيانات المرسلة لجوجل شيت
            timestamp: timestamp, ip: ip, country: country, city: city, continent: continent, isp: isp,
            utm_source: body.utm_source || 'N/A', utm_medium: body.utm_medium || 'N/A', utm_campaign: body.utm_campaign || 'N/A',
            utm_term: body.utm_term || 'N/A', utm_content: body.utm_content || 'N/A', referrer: body.referrer || 'N/A',
            page: body.page || 'N/A', device: body.device || 'N/A', os: body.os || 'N/A', browser: body.browser || 'N/A',
            screenRes: body.screenRes || 'N/A', lang: body.lang || 'N/A', timezone: body.tz || 'N/A',
            redirectStatus: redirectStatus
        };

        const tgPromise = fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: telegramMessage, parse_mode: 'HTML' })
        });

        const sheetPromise = fetch(GOOGLE_SHEET_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sheetsData)
        });

        await Promise.allSettled([tgPromise, sheetPromise]);

        return new Response(JSON.stringify({ status: 'success' }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

    } catch (error) {
        return new Response(JSON.stringify({ status: 'error', message: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}