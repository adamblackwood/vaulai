// functions/track.js

const TELEGRAM_TOKEN = '8424656659:AAEbo9X2Kuw1QZDRPyu_Uy-SNg6T36vQoRg';
const CHAT_ID = '7203463194';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context) {
    const request = context.request;

    try {
        const body = await request.json();
        const ip = request.headers.get('CF-Connecting-IP') || 'Unknown';
        const country = request.cf?.country || 'Unknown';
        const city = request.cf?.city || 'Unknown';

        const telegramMessage = `
🚀 <b>New VaultAI Visitor</b>
━━━━━━━━━━━━━━━━━
🌐 <b>Geo &amp; IP:</b>
• IP: <code>${ip}</code>
• Country: ${country}
• City: ${city}
━━━━━━━━━━━━━━━━━
📱 <b>Device &amp; Browser:</b>
• Device: ${body.device || 'N/A'}
• OS: ${body.os || 'N/A'}
• Browser: ${body.browser || 'N/A'}
━━━━━━━━━━━━━━━━━
🔗 <b>Traffic Data:</b>
• Page: ${body.page || 'N/A'}
• Referrer: ${body.referrer || 'N/A'}
• UTM Source: ${body.utm_source || 'N/A'}
• UTM Campaign: ${body.utm_campaign || 'N/A'}
        `.trim();

        const tgApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        
        const tgResponse = await fetch(tgApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: telegramMessage,
                parse_mode: 'HTML'
            })
        });

        const tgData = await tgResponse.json();

        if (!tgData.ok) {
            // إذا فشل الإرسال لتليجرام، نرجع الخطأ للمتصفح لنراه في الـ Console
            return new Response(JSON.stringify({ 
                status: 'telegram_error', 
                error_code: tgData.error_code,
                description: tgData.description 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        return new Response(JSON.stringify({ status: 'success' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

    } catch (error) {
        return new Response(JSON.stringify({ status: 'server_error', message: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}