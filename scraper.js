const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://www.meetup.com/aws-girls-peru/';
const EVENTS_URL = 'https://www.meetup.com/aws-girls-peru/events/';

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetch(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function scrape() {
    const [html, eventsHtml] = await Promise.all([fetch(BASE_URL), fetch(EVENTS_URL)]);

    // Miembros
    const membersMatch = html.match(/([\d,]+)\s*members/);
    const members = membersMatch ? membersMatch[1] : '1,282';

    // Rating
    const ratingMatch = html.match(/([\d.]+)\s*•/);
    const rating = ratingMatch ? ratingMatch[1] : '4.9';

    // Total eventos pasados
    const pastMatch = html.match(/Past events\s*<[^>]*>\s*(\d+)/i) || html.match(/"pastEvents"[^}]*"count"\s*:\s*(\d+)/);
    const totalEvents = pastMatch ? pastMatch[1] : '44';

    // Próximos eventos desde la página de eventos
    const upcomingEvents = [];
    const eventBlocks = eventsHtml.match(/<a[^>]*events\/\d+[^>]*>[\s\S]*?<\/a>/gi) || [];

    for (const block of eventBlocks.slice(0, 4)) {
        const titleMatch = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        const dateMatch = block.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*(\w+\s+\d+)/);
        const timeMatch = block.match(/(\d+:\d+\s*[AP]M)/);
        const isOnline = /Online/i.test(block);
        const isHybrid = /Hybrid/i.test(block);

        if (titleMatch) {
            const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
            upcomingEvents.push({
                title,
                date: dateMatch ? dateMatch[0] : '',
                time: timeMatch ? timeMatch[1] : '',
                type: isOnline ? 'Online' : isHybrid ? 'Híbrido' : 'Presencial'
            });
        }
    }

    const data = {
        members,
        rating,
        totalEvents,
        upcomingEvents,
        lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('✅ data.json actualizado:', JSON.stringify(data, null, 2));
}

scrape().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
