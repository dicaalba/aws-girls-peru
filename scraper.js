const https = require('https');
const fs = require('fs');

function gql(query) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ query });
        const options = {
            hostname: 'www.meetup.com',
            path: '/gql2',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'User-Agent': 'Mozilla/5.0'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const json = JSON.parse(data);
                if (json.errors) reject(new Error(JSON.stringify(json.errors)));
                else resolve(json.data);
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function scrape() {
    const [membersData, pastData, upcomingData] = await Promise.all([
        gql(`{ groupByUrlname(urlname: "aws-girls-peru") { memberships { totalCount } } }`),
        gql(`{ groupByUrlname(urlname: "aws-girls-peru") { events(filter: { status: PAST }, first: 1) { totalCount } } }`),
        gql(`{ groupByUrlname(urlname: "aws-girls-peru") { events { edges { node { title dateTime eventType venue { name city } } } } } }`)
    ]);

    const members = membersData.groupByUrlname.memberships.totalCount.toLocaleString('en');
    const totalEvents = pastData.groupByUrlname.events.totalCount.toString();

    const upcomingEvents = upcomingData.groupByUrlname.events.edges.map(({ node }) => {
        const dt = new Date(node.dateTime);
        const date = dt.toLocaleDateString('es-PE', { weekday: 'short', month: 'short', day: 'numeric' });
        const time = dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        const type = node.eventType === 'ONLINE' ? 'Online'
                   : node.eventType === 'HYBRID' ? 'Híbrido'
                   : 'Presencial';
        const venue = node.venue ? node.venue.name : '';
        return { title: node.title, date, time, type, venue };
    });

    const data = {
        members,
        rating: '4.9',
        totalEvents,
        upcomingEvents,
        lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('✅ data.json actualizado:', JSON.stringify(data, null, 2));
}

scrape().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
