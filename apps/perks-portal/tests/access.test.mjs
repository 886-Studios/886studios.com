import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable, PassThrough } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { createAuth, createRateLimiter, SESSION_SECONDS } from '../src/auth.mjs';
import { createHandler } from '../src/server.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const config = { root, code: 'N8pvR6hZ1qLm2sK5', secret: '73415f9a0d63e8b7f3a296bc90d74e285bf3c60498d1a275ec639bd07f4a6e82', origin: 'https://perks.886studios.com' };
const fake = { perks: [{ id:'test-partner',name:'Private Test Partner',category:'Engineering',headline:'Private test offer',description:'Private test description',about:'A platform for prototyping & collaboration.',offer:'Confidential credit allowance',instructions:'Use the partner link.',eligibility:'Portfolio companies',programs:[],href:'https://partner.example/private-referral',source:'https://notion.so/example',action:'Redeem perk',links:[] }] };
const make = extra => createHandler({ ...config, catalog:fake, limiter:createRateLimiter(), ...extra });
async function request(handler, path='/', { method='GET', headers={}, body='', stream }={}) {
  const req=stream ?? Readable.from(body ? [Buffer.from(body)] : []);
  Object.assign(req,{url:path,method,headers,socket:{remoteAddress:'127.0.0.1'}});
  const result={headers:{},status:0,body:''};
  const res={headersSent:false,setHeader(k,v){result.headers[k.toLowerCase()]=v},writeHead(status,values={}){result.status=status;for(const [k,v]of Object.entries(values))this.setHeader(k,v);this.headersSent=true},end(body){result.body=String(body??'')}};
  await handler(req,res);
  return result;
}
const login = (handler, code=config.code, extra={}) => request(handler,'/login',{method:'POST',headers:{origin:config.origin,'content-type':'application/x-www-form-urlencoded',...extra},body:new URLSearchParams({code}).toString()});

test('indexing exclusions survive authentication, assets, redirects, and error responses', async () => {
  for (const basePath of ['', '/perks']) {
    const handler = make({ basePath });
    const home = basePath || '/';
    const signed = await request(handler, `${basePath}/login`, {
      method: 'POST', headers: { origin: config.origin, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code: config.code }).toString(),
    });
    const cookie = signed.headers['set-cookie'].split(';')[0];
    const responses = [signed];
    for (const headers of [{}, { cookie }]) {
      for (const path of [home, `${home}?q=test`, `${basePath}/login`, `${basePath}/styles.css`, `${basePath}/app.js`, `${basePath}/private/catalog.json`, `${basePath}/missing`]) {
        responses.push(await request(handler, path, { headers }));
      }
      responses.push(await request(handler, home, { method: 'HEAD', headers }));
    }
    responses.push(await request(handler, `${basePath}/login`, { method: 'POST' }));
    responses.push(await request(handler, home, { method: 'PUT' }));
    responses.push(await request(make({ basePath, code: undefined }), home));
    for (const response of responses) {
      for (const rule of ['noindex', 'nofollow', 'noarchive', 'nosnippet', 'noimageindex']) {
        assert.ok(response.headers['x-robots-tag'].split(/,\s*/).includes(rule), `${response.status}: ${rule}`);
      }
      if (response.body.startsWith('<!doctype html>')) {
        assert.ok(response.body.includes(`<meta name="robots" content="${response.headers['x-robots-tag']}">`));
      }
    }
    // Crawlers must be able to read noindex; robots.txt is not an indexing exclusion.
    assert.equal((await request(handler, `${basePath}/robots.txt`)).body, 'User-agent: *\nAllow: /\n');
  }
});

test('locked HTML and every public asset contain no private partner data',async()=>{
  const handler=make();
  for(const path of ['/','/login','/?q=Private','/styles.css','/app.js']) {
    const result=await request(handler,path);
    assert.equal(result.status,200);
    assert.doesNotMatch(result.body,/Private Test Partner|private-referral|Confidential credit allowance|prototyping|test-portfolio-code-123/);
  }
});
test('private data and server files cannot be requested directly, even with a session',async()=>{
  const handler=make(); const signed=await login(handler);
  for(const path of ['/private/catalog.json','/private/source-records.json','/private/dev-access.json','/src/server.mjs','/.env.local','/api/perks','/assets/../private/catalog.json','/%2e%2e/private/catalog.json','/assets/%2e%2e/%2e%2e/private/catalog.json','/index']) {
    for(const headers of [{},{cookie:signed.headers['set-cookie'].split(';')[0]}]) {
      const result=await request(handler,path,{headers});assert.equal(result.status,404,path);assert.doesNotMatch(result.body,/private-referral/);
    }
  }
});
test('valid code creates an HTTP-only secure session and unlocks partner links',async()=>{
  const handler=make();const signed=await login(handler);
  assert.equal(signed.status,303);assert.equal(signed.headers.location,'/');
  assert.match(signed.headers['set-cookie'],/^__Host-886_perks=/);
  for(const flag of ['HttpOnly','Secure','SameSite=Strict','Path=/'])assert.ok(signed.headers['set-cookie'].includes(flag));
  const result=await request(handler,'/',{headers:{cookie:signed.headers['set-cookie'].split(';')[0]}});
  assert.equal(result.status,200);assert.match(result.body,/https:\/\/partner.example\/private-referral/);
  assert.match(result.body,/<h3>About Private Test Partner<\/h3>/);
  assert.match(result.body,/A platform for prototyping &amp; collaboration\./);
  const searched=await request(handler,'/?q=prototyping',{headers:{cookie:signed.headers['set-cookie'].split(';')[0]}});
  assert.match(searched.body,/1 partner/);
  assert.match(result.headers['cache-control'],/no-store/);assert.equal(result.headers['vercel-cdn-cache-control'],'no-store');
});
test('invalid codes and forged cookies do not unlock the directory',async()=>{
  const handler=make();assert.equal((await login(handler,'wrong')).status,401);
  const signed=await login(handler);const cookie=signed.headers['set-cookie'].split(';')[0];
  for(const candidate of ['886_perks=true','__Host-886_perks=true',cookie.slice(0,-1)+'!',cookie+'; '+cookie]) {
    const result=await request(handler,'/',{headers:{cookie:candidate}});assert.doesNotMatch(result.body,/private-referral/);
  }
});
test('sessions expire after seven days and credential rotation invalidates them',()=>{
  let now=1_800_000_000_000;
  const auth=createAuth({...config,now:()=>now});const cookie=auth.issue().split(';')[0];assert.equal(auth.valid(cookie),true);
  assert.equal(createAuth({...config,code:'rotated-code-with-long-entropy',now:()=>now}).valid(cookie),false);
  assert.equal(createAuth({...config,secret:'rotated-secret-with-more-than-thirty-two-characters',now:()=>now}).valid(cookie),false);
  now+=SESSION_SECONDS*1000;assert.equal(auth.valid(cookie),false);
});
test('cross-site, missing-origin, and non-form login requests are rejected',async()=>{
  const handler=make();
  for(const origin of ['https://evil.example','null',undefined])assert.equal((await login(handler,config.code,{origin})).status,403);
  assert.equal((await login(handler,config.code,{'sec-fetch-site':'cross-site'})).status,403);
  assert.equal((await login(handler,config.code,{'content-type':'application/json'})).status,415);
  assert.equal((await login(handler,config.code,{'content-length':'4096'})).status,413);
});
test('failed attempts are throttled and recover after the window',async()=>{
  let now=0;const limiter=createRateLimiter({now:()=>now});const handler=make({limiter});
  for(let i=0;i<8;i++)assert.equal((await login(handler,'bad')).status,401);
  assert.equal((await login(handler)).status,429);now+=900_001;assert.equal((await login(handler)).status,303);
});
test('concurrent delayed login bodies cannot exceed the failed-attempt budget', async () => {
  const handler = make();
  const streams = Array.from({ length: 20 }, () => new PassThrough());
  const pending = streams.map(stream => request(handler, '/login', {
    method: 'POST', headers: { origin: config.origin, 'content-type': 'application/x-www-form-urlencoded' }, stream,
  }));
  // All handlers have started reading before any body completes.
  await new Promise(resolve => setImmediate(resolve));
  streams.forEach(stream => stream.end('code=wrong'));
  const results = await Promise.all(pending);
  assert.equal(results.filter(result => result.status === 401).length, 8);
  assert.equal(results.filter(result => result.status === 429).length, 12);
  assert.equal((await login(handler)).status, 429);
});
test('successful logins retain the existing counter-reset behavior', async () => {
  const handler = make();
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let i = 0; i < 7; i++) assert.equal((await login(handler, 'wrong')).status, 401);
    assert.equal((await login(handler)).status, 303);
  }
});
test('local limiter capacity fails closed and expired keys free capacity', () => {
  let now = 0;
  const limiter = createRateLimiter({ now: () => now, capacity: 2 });
  limiter.fail('a'); limiter.fail('b');
  assert.equal(limiter.blocked('c'), true);
  assert.equal(limiter.blocked('a'), false);
  now = 900_001;
  assert.equal(limiter.blocked('c'), false);
  limiter.fail('c');
  assert.equal(limiter.blocked('d'), false);
});
test('legacy valid credentials and already-issued sessions remain compatible', async () => {
  const legacy = { code: 'sample', secret: 'legacy-session-key-32-characters!' };
  const now = () => 1_800_000_001_000;
  const handler = make({ ...legacy, now });
  const signed = await login(handler, legacy.code);
  assert.equal(signed.status, 303);
  const auth = createAuth({ ...config, ...legacy, now });
  assert.equal(auth.valid(signed.headers['set-cookie'].split(';')[0]), true);
  // Fixed token from the original signing format, independent of current issue().
  const existingCookie = '__Host-886_perks=1800000000.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.5Kriu6aIRY_kTC6019fneVe3tFR3rtfO4eLb9-k3Jt0';
  const authenticated = await request(handler, '/', { headers: { cookie: existingCookie } });
  assert.match(authenticated.body, /private-referral/);
});
test('sign out clears the browser session and direct GET cannot sign out',async()=>{
  const handler=make();const result=await request(handler,'/logout',{method:'POST',headers:{origin:config.origin}});
  assert.equal(result.status,303);assert.match(result.headers['set-cookie'],/Max-Age=0/);
  assert.equal((await request(handler,'/logout')).status,404);
});
test('missing credentials fail closed, and private responses are not indexable',async()=>{
  const handler=make({code:undefined});const result=await request(handler);
  assert.equal(result.status,503);assert.doesNotMatch(result.body,/private-referral/);
  assert.match(result.headers['x-robots-tag'],/noindex/);
  assert.match((await request(handler,'/robots.txt')).body,/Allow: \//);
});
test('search query injection is escaped and unknown categories are discarded',async()=>{
  const handler=make();const cookie=(await login(handler)).headers['set-cookie'].split(';')[0];
  const result=await request(handler,'/?q='+encodeURIComponent('"><img src=x onerror=alert(1)>')+'&category=unknown',{headers:{cookie}});
  assert.doesNotMatch(result.body,/<img src=x/);assert.match(result.body,/&lt;img src=x/);
  assert.match(result.body,/0 partners/);
});

test('sorting is rendered on the server and combines with search, filters, and subpath reset',async()=>{
  const origin='https://www.886studios.com';
  const catalog={perks:[
    {...fake.perks[0],id:'zulu',name:'Zulu',category:'Engineering'},
    {...fake.perks[0],id:'alpha',name:'Alpha',category:'Design'},
    {...fake.perks[0],id:'beta',name:'Beta',category:'Engineering'}
  ]};
  const handler=make({origin,basePath:'/perks',catalog});
  const signed=await request(handler,'/perks/login',{method:'POST',headers:{origin,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:config.code}).toString()});
  const headers={cookie:signed.headers['set-cookie'].split(';')[0]};
  const rows=html=>[...html.matchAll(/<details class="perk-row" id="([^"]+)"([^>]*)>/g)];
  for(const query of ['', '?sort=unknown']) {
    const result=await request(handler,'/perks'+query,{headers});
    assert.deepEqual(rows(result.body).map(row=>row[1]),['alpha','beta','zulu']);
    assert.match(result.body,/<input type="radio" name="sort" value="alphabetical" aria-label="Alphabetical \(A–Z\)" checked>/);
  }
  const grouped=await request(handler,'/perks?sort=category',{headers});
  assert.deepEqual(rows(grouped.body).map(row=>row[1]),['beta','zulu','alpha']);
  assert.match(grouped.body,/href="\/perks\?sort=category" data-reset/);
  const result=await request(handler,'/perks?sort=alphabetical&category=Engineering&q=beta',{headers});
  assert.deepEqual(rows(result.body).map(row=>row[1]),['alpha','beta','zulu']);
  assert.deepEqual(rows(result.body).filter(row=>!row[2].includes('hidden')).map(row=>row[1]),['beta']);
  assert.match(result.body,/<input type="radio" name="sort" value="alphabetical" aria-label="Alphabetical \(A–Z\)" checked>/);
  assert.equal((result.body.match(/name="sort"[^>]* checked/g)||[]).length,1);
  assert.match(result.body,/href="\/perks" data-reset/);
  assert.match(result.body,/1 partner/);
  assert.match(result.headers['x-robots-tag'],/noindex/);
  assert.match(result.headers['cache-control'],/no-store/);
  const beta=rows(result.body).find(row=>row[1]==='beta')[2];
  assert.match(beta,/data-sort-category="0"/);
  assert.match(beta,/data-sort-alphabetical="1"/);
});

test('a subpath keeps login, filters, assets, and redirects inside the portal',async()=>{
  const origin='https://www.886studios.com';
  const handler=make({origin,basePath:'/perks',catalog:{perks:[{...fake.perks[0],logo:'/assets/logos/notion.webp'}]}});
  const locked=await request(handler,'/perks');
  assert.equal(locked.status,200);
  assert.match(locked.body,/action="\/perks\/login"/);
  assert.doesNotMatch(locked.body,/private-referral/);
  const signed=await request(handler,'/perks/login',{method:'POST',headers:{origin,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:config.code}).toString()});
  assert.equal(signed.status,303);
  assert.equal(signed.headers.location,'/perks');
  assert.match(signed.headers['set-cookie'],/^__Secure-886_perks=/);
  assert.match(signed.headers['set-cookie'],/Path=\/perks;/);
  assert.doesNotMatch(signed.headers['set-cookie'],/Domain=/i);
  const headers={cookie:signed.headers['set-cookie'].split(';')[0]};
  const unlocked=await request(handler,'/perks?category=Engineering&q=Private',{headers});
  assert.match(unlocked.body,/1 partner/);
  assert.match(unlocked.body,/private-referral/);
  assert.match(unlocked.body,/href="\/perks" data-reset/);
  assert.match(unlocked.body,/src="\/perks\/assets\/logos\/notion.webp"/);
  for(const html of [locked.body,unlocked.body])for(const [,url]of html.matchAll(/(?:href|src|action)="(\/[^\"]*)"/g))assert.ok(url==='/perks'||url.startsWith('/perks/'),url);
  for(const path of ['/perks/styles.css','/perks/app.js','/perks/assets/fonts/geist-400.ttf','/perks/assets/886-logo.avif'])assert.equal((await request(handler,path)).status,200,path);
  assert.equal((await request(handler,'/perks/login',{headers})).headers.location,'/perks');
  const signedOut=await request(handler,'/perks/logout',{method:'POST',headers:{...headers,origin}});
  assert.equal(signedOut.headers.location,'/perks');
  assert.match(signedOut.headers['set-cookie'],/Max-Age=0; Path=\/perks;/);
});

test('the subpath rejects other routes, private files, and the old login origin',async()=>{
  const handler=make({origin:'https://www.886studios.com',basePath:'/perks'});
  for(const path of ['/','/login','/styles.css','/perks-other','/perks/private/catalog.json','/perks/src/server.mjs','/perks/../private/catalog.json'])assert.equal((await request(handler,path)).status,404,path);
  const rejected=await request(handler,'/perks/login',{method:'POST',headers:{origin:config.origin,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:config.code}).toString()});
  assert.equal(rejected.status,403);
  const missing=await request(make({basePath:'/perks',code:undefined}),'/perks');
  assert.equal(missing.status,503);
  assert.match(missing.body,/action="\/perks\/login"/);
  assert.throws(()=>make({basePath:'/perks/../'}),/APP_BASE_PATH/);
});
