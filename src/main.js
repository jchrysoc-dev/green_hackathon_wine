import './style.css';
import './quiz.css';
import './commerce.css';
import './brand.css';
import './sustainability.css';
import './wine-detail.css';
import catalogue from './data/wines.json';

const wines = catalogue.wines;
const DEMO_WINE_ID = 'mcguigan-estate-merlot';
const QUIZ_WINE_IDS = ['mcguigan-estate-merlot', 'southbank-merlot', 'southern-cross-shiraz-merlot'];
const quizQuestions = [
  { question: 'Your ideal snack has…', hint: 'Go with your first instinct.', options: [
    { label: 'A bright citrus tang', note: 'zesty and fresh', scores: { body: 1, acidity: 5, fruit: 3, tannin: 1, sweetness: 1 } },
    { label: 'A bowl of ripe berries', note: 'juicy and generous', scores: { body: 2, acidity: 3, fruit: 5, tannin: 1, sweetness: 2 } },
    { label: 'Dark chocolate and nuts', note: 'deep and savoury', scores: { body: 4, acidity: 1, fruit: 2, tannin: 4, sweetness: 2 } }
  ]},
  { question: 'Pick a pasta for tonight.', hint: 'The sauce tells us a lot.', options: [
    { label: 'Tomato and basil', note: 'bright and herby', scores: { body: 3, acidity: 4, fruit: 4, tannin: 2, sweetness: 1 } },
    { label: 'Creamy mushroom', note: 'soft and earthy', scores: { body: 4, acidity: 2, fruit: 3, tannin: 2, sweetness: 2 } },
    { label: 'Slow-cooked ragù', note: 'rich and savoury', scores: { body: 5, acidity: 2, fruit: 3, tannin: 4, sweetness: 1 } }
  ]},
  { question: 'Which texture sounds best?', hint: 'Think about the feel, not the flavour.', options: [
    { label: 'Crisp and clean', note: 'light on its feet', scores: { body: 1, acidity: 5, fruit: 2, tannin: 1, sweetness: 1 } },
    { label: 'Juicy and soft', note: 'smooth with plenty of fruit', scores: { body: 3, acidity: 2, fruit: 5, tannin: 2, sweetness: 2 } },
    { label: 'Deep with a little grip', note: 'structured and lingering', scores: { body: 5, acidity: 2, fruit: 3, tannin: 5, sweetness: 1 } }
  ]},
  { question: 'Choose a fruit bowl.', hint: 'There are no wrong answers.', options: [
    { label: 'Lemon and green apple', note: 'sharp and lively', scores: { body: 1, acidity: 5, fruit: 2, tannin: 1, sweetness: 1 } },
    { label: 'Strawberry and plum', note: 'round and red-fruited', scores: { body: 3, acidity: 3, fruit: 5, tannin: 2, sweetness: 2 } },
    { label: 'Blackberry and fig', note: 'dark and concentrated', scores: { body: 5, acidity: 2, fruit: 4, tannin: 4, sweetness: 2 } }
  ]},
  { question: 'How sweet is just right?', hint: 'This includes fruit sweetness, too.', options: [
    { label: 'Barely at all', note: 'dry and direct', scores: { body: 3, acidity: 3, fruit: 3, tannin: 3, sweetness: 1 } },
    { label: 'Just a hint', note: 'ripe but balanced', scores: { body: 3, acidity: 2, fruit: 4, tannin: 2, sweetness: 2 } },
    { label: 'I have a sweet tooth', note: 'soft and lush', scores: { body: 2, acidity: 2, fruit: 5, tannin: 1, sweetness: 5 } }
  ]}
];
const storedValue = (key, legacyKey) => { try { return localStorage.getItem(key) ?? localStorage.getItem(legacyKey); } catch { return null; } };
const storedNumber = (key, legacyKey) => Number(storedValue(key, legacyKey) || 0);
const state = { page: 'home', selected: null, age: storedValue('loovin-age','tasteme-age') === 'yes', tasted: false, returned: storedNumber('loovin-returned','tasteme-returned'), refund: storedNumber('loovin-refund','tasteme-refund'), orders: storedNumber('loovin-orders','tasteme-orders'), quizStep: 0, quizAnswers: [], quizProfile: null };
const $ = (s) => document.querySelector(s);
const saveReturns = () => { try { localStorage.setItem('loovin-returned', state.returned); localStorage.setItem('loovin-refund', state.refund.toFixed(2)); } catch {} };

function shell(content) {
  return `<div class="app-shell"><header class="topbar"><button class="brand" data-go="home" aria-label="LooVin home"><img src="/loovin-logo.png" alt=""><span>LooVin</span></button><button class="impact" data-go="impact">${state.returned} bottles back in use <i>↗</i></button></header>${content}<nav class="dock"><button class="active" data-go="home"><span>⌂</span>Home</button><button data-go="scan"><span>◎</span>Scan</button><button data-go="impact"><span>↺</span>My impact</button></nav></div>`;
}
function warning(){ return `<p class="legal">L'abus d'alcool est dangereux pour la santé, à consommer avec modération.</p>`; }
function render(){
  if(!state.age){
    $('#app').innerHTML = `<main class="gate"><img class="gate-logo" src="/loovin-logo.png" alt="LooVin — Your Taste. Less Waste."><p class="kicker">Your Taste. Less Waste.</p><h1>Meet wine<br/><em>your way.</em></h1><p class="gate-copy">A simple guide to bottles matched to your palate, with reusable choices brought forward.</p><div class="gate-card"><strong>Avez-vous 18 ans ou plus ?</strong><small>Required to enter LooVin in France.</small><div class="gate-actions"><button class="button dark" data-age="yes">Over 18 — enter</button><button class="button outline" data-age="no">Under 18</button></div></div></main>`;
    bind();
    return;
  }
  let content = state.page==='home' ? home() : state.page==='scan' ? scan() : state.page==='quiz' ? quiz() : state.page==='results' ? results() : state.page==='checkout' ? checkout() : state.page==='confirmation' ? confirmation() : state.page==='stores' ? stores() : state.page==='route' ? routeFinder() : state.page==='producers' ? producers() : state.page==='impact' ? impact() : detail();
  $('#app').innerHTML = shell(content); bind();
}
function home(){
  const match=wines.find(w=>w.id==='southbank-merlot');
  return `<main class="page home"><div class="notice">La vente d'alcool aux mineurs est interdite.</div><section class="hero"><p class="kicker">Your Taste. Less Waste.</p><h1>Wine matched<br/><em>to you.</em></h1><p>Find bottles that fit your palate, with lower-waste choices brought forward.</p><button class="button dark wide" data-go="scan">Scan a bottle <span>→</span></button><button class="text-button" data-start-quiz>or start with a taste quiz</button></section><section class="feature"><div class="feature-copy"><p class="kicker">Picked for a soft, fruity palate</p><h2>${match.name}</h2><p class="muted">${match.tags.join(' · ')} · ${match.region}</p><button class="button pale" data-wine="${match.id}">See why it fits</button></div><div class="bottle-art"><div class="bottle-neck"></div><div class="bottle-body"><span>LV</span><b>AUSTRALIA</b><small>soft red</small></div></div></section><section class="shared-story"><figure><img src="/images/wine-shared-at-home.jpg" width="1200" height="800" loading="lazy" alt="Two adults sharing red wine with dinner at home"><figcaption>One bottle. A better loop.</figcaption></figure><div class="shared-copy"><p class="kicker">Wine, enjoyed well</p><h2>Enjoy the wine. Keep the bottle moving.</h2><p>Choose what you’ll love, buy closer when you can, then return the glass for another round.</p></div><div class="loop-principles"><div><strong>Match first</strong><span>Choose with confidence.</span></div><div><strong>Buy closer</strong><span>Skip an extra journey.</span></div><div><strong>Bring it back</strong><span>Keep good glass in use.</span></div></div></section><section class="route-ribbon"><div class="route-track" aria-hidden="true"><i></i><span></span><i></i></div><div><p class="kicker">Already heading out?</p><h2>Find a bottle on your route.</h2><p>Tell us where you’re going. We’ll find wine shops along the way.</p><button class="button route-button" data-go="route">Plan a bottle stop</button></div></section><section class="producer-pitch"><div class="producer-stamp" aria-hidden="true">LOCAL<br>DIRECT</div><div><h2>Buy direct. Pay less.</h2><p>Meet nearby producers, skip extra markups and keep more value local.</p><button class="producer-link" data-go="producers">Find local producers <span>↗</span></button></div></section><section class="how"><p class="kicker">Three small steps</p><div class="steps"><div><b>01</b><strong>Scan</strong><span>the bottle in front of you</span></div><div><b>02</b><strong>Match</strong><span>your taste to the catalogue</span></div><div><b>03</b><strong>Return</strong><span>the reusable one when done</span></div></div></section>${warning()}</main>`;
}
function scan(){ return `<main class="page scan"><p class="kicker">The bottle in front of you</p><h1>Let’s see<br/><em>what it is.</em></h1><div class="scanner"><div class="scan-line"></div><div class="scan-corners"></div><span>Point your camera at the label</span></div><button class="button dark wide" data-scan-file>Take or choose a photo</button><input id="scan-file" type="file" accept="image/*" capture="environment" hidden><button class="button outline wide" data-demo>Use demo bottle</button><p id="scan-status" class="micro">Demo recognition runs on this device. Your photo is never uploaded.</p><div id="scan-results"></div><section class="scan-purpose"><strong>Scan for more than a name.</strong><p>See what you’ll enjoy before you buy, then find a closer shop or a bottle that can come back.</p></section></main>`; }
function quiz(){
  const q = quizQuestions[state.quizStep];
  const progress = quizQuestions.map((_, index) => `<i class="${index <= state.quizStep ? 'filled' : ''}"></i>`).join('');
  return `<main class="page quiz-page"><div class="quiz-top"><button class="back" data-quiz-back>${state.quizStep ? '← Previous' : '← Home'}</button><span>${state.quizStep + 1} of ${quizQuestions.length}</span></div><div class="quiz-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="1" aria-valuemax="${quizQuestions.length}" aria-valuenow="${state.quizStep+1}">${progress}</div><section class="quiz-question"><p class="kicker">Your taste, translated</p><h1>${q.question}</h1><p>${q.hint}</p><div class="quiz-options">${q.options.map((option,index)=>`<button data-answer="${index}"><strong>${option.label}</strong><span>${option.note}</span></button>`).join('')}</div></section>${state.quizStep===0?'<button class="text-button" data-demo-quiz>Fill with demo answers</button>':''}</main>`;
}
function results(){
  const profile = state.quizProfile || { body: 3, acidity: 2, fruit: 4, tannin: 2, sweetness: 2 };
  const traits = Object.entries(profile).map(([name,value])=>`<div class="trait"><span>${name}</span><div><i style="width:${value*20}%"></i></div><b>${value}/5</b></div>`).join('');
  const matches = QUIZ_WINE_IDS.map(id=>wines.find(w=>w.id===id)).filter(Boolean).map(w=>({...w,match:profileMatch(profile,w.flavour)})).sort((a,b)=>b.match-a.match);
  const title = profile.body >= 4 ? 'The velvet & depth palate' : profile.fruit >= 4 ? 'The bright fruit seeker' : 'The soft red explorer';
  return `<main class="page results-page"><p class="kicker">Your taste profile</p><h1>${title}</h1><p class="results-intro">You lean toward generous fruit, a smooth texture and softer tannins. These three Australian reds are a strong place to start.</p><div class="profile-label">${traits}</div><section class="recommendations"><h2>Your three to try</h2>${matches.map((w,index)=>`<button class="wine-row" data-wine="${w.id}"><span class="wine-rank">${index+1}</span><span><strong>${w.name}</strong><small>${w.tags.slice(0,2).join(' · ')}</small></span><b>${w.match}%</b></button>`).join('')}</section><button class="button outline wide" data-restart-quiz>Retake the quiz</button>${warning()}</main>`;
}
function finishQuiz(){
  const traits = ['body','acidity','fruit','tannin','sweetness'];
  state.quizProfile = Object.fromEntries(traits.map(trait=>[trait,Math.round(state.quizAnswers.reduce((sum,answer)=>sum+answer[trait],0)/state.quizAnswers.length)]));
  try { localStorage.setItem('loovin-profile', JSON.stringify(state.quizProfile)); } catch {}
  state.page = 'results'; render();
}
function profileMatch(profile, flavour){
  const distance = Math.sqrt(Object.keys(profile).reduce((sum,trait)=>sum+Math.pow(profile[trait]-flavour[trait],2),0));
  return Math.max(70, Math.round(100-(distance/Math.sqrt(80))*100));
}
function wineProfile(w){
  if(!w.profile) return '';
  const notes=w.profile.notes.map(note=>`<div><strong>${note.name}</strong><span>${note.detail}</span></div>`).join('');
  return `<section class="wine-profile"><p class="kicker">Inside the bottle</p><h2>${w.profile.headline}</h2><div class="tasting-notes">${notes}</div><div class="maker-note"><span>From the vineyard</span><p>${w.profile.story}</p></div><p class="serve-note"><b>Best with</b>${w.profile.serve}</p><dl class="bottle-specs"><div><dt>ABV</dt><dd>${w.profile.abv}</dd></div><div><dt>Bottle</dt><dd>${w.profile.size}</dd></div><div><dt>Closure</dt><dd>${w.profile.closure}</dd></div></dl></section>`;
}
function detail(){ const w=state.selected||wines[1]; const identified=w.id===DEMO_WINE_ID; return `<main class="page detail"><button class="back" data-go="home">← Back</button><div class="detail-head"><div class="bottle-art large"><div class="bottle-neck"></div><div class="bottle-body"><span>MG</span><b>${identified?'AUSTRALIA':w.region}</b><small>${w.tags[0]}</small></div></div><div><p class="kicker">${w.producer}</p><h1>${w.name.replace('PLACEHOLDER – ','')}</h1><p class="muted">${w.region} · ${w.colour} · €${w.price_eur.toFixed(2)}</p></div></div><div class="match"><strong>${identified?'Found':'92%'}</strong><span>${identified?'bottle identified':'match for your palate'}</span><p>${identified?w.description:'Light and fruity, with the same fresh red-fruit character you tend to like.'}</p></div>${wineProfile(w)}<div class="facts"><div><span>Style</span><b>${w.tags.join(', ')}</b></div><div><span>With</span><b>${w.pairings.slice(0,2).join(' or ')}</b></div><div><span>Bottle</span><b>${w.bottle.type}${w.bottle.deposit_eur ? ` · €${w.bottle.deposit_eur.toFixed(2)} deposit` : ''}</b></div></div><section class="detail-impact"><span>One lower-impact move</span><strong>Make the shop part of your journey.</strong><p>Find a wine shop on a route you already take instead of making a separate trip.</p><button data-go="route">Find a stop on my route</button></section><button class="button dark wide" data-checkout>Buy from producer · €${w.price_eur.toFixed(2)}</button><button class="button outline wide" data-nearby>Find a shop nearby</button>${warning()}</main>`; }
function checkout(){ const w=state.selected||wines.find(wine=>wine.id===DEMO_WINE_ID); const total=w.price_eur+w.bottle.deposit_eur; return `<main class="page checkout-page"><div class="notice">La vente d'alcool aux mineurs est interdite.</div><button class="back" data-back-detail>← Back to wine</button><p class="kicker">Demo checkout</p><h1>One bottle.<br/><em>No details needed.</em></h1><p class="checkout-intro">This is a simulated order. No payment or personal information will be collected.</p><section class="order-slip"><div><span>Wine</span><strong>${w.name}</strong></div><div><span>Bottle</span><strong>€${w.price_eur.toFixed(2)}</strong></div>${w.bottle.deposit_eur?`<div><span>Refundable deposit</span><strong>€${w.bottle.deposit_eur.toFixed(2)}</strong></div>`:''}<div class="order-total"><span>Demo total</span><strong>€${total.toFixed(2)}</strong></div></section><div class="breathalyser"><strong>Éthylotests are available</strong><p>Breathalysers are available from pharmacies and road-safety retailers.</p></div><button class="button dark wide" data-place-order>Place demo order <span>→</span></button>${warning()}</main>`; }
function confirmation(){ const w=state.selected||wines.find(wine=>wine.id===DEMO_WINE_ID); return `<main class="page confirmation-page"><div class="notice">La vente d'alcool aux mineurs est interdite.</div><div class="confirmation-mark">✓</div><p class="kicker">Demo order placed</p><h1>That’s<br/><em>confirmed.</em></h1><p>No payment was taken and no personal details were collected.</p><section class="order-slip"><div><span>Wine</span><strong>${w.name}</strong></div><div><span>Order</span><strong>LV-${String(state.orders).padStart(3,'0')}</strong></div></section><section class="post-pour"><span>After the last glass</span><h2>Return when you can. Recycle when you can’t.</h2><p>Check the bottle, keep reusable glass in the loop and recycle the rest locally.</p><button data-go="impact">See the return loop</button></section><button class="button dark wide" data-go="home">Back to home <span>→</span></button>${warning()}</main>`; }
function stores(){ return `<main class="page stores-page"><button class="back" data-back-detail>← Back to wine</button><p class="kicker">Near you</p><h1>Find a bottle<br/><em>close by.</em></h1><p class="stores-intro">We’ll use your current location once to find nearby wine and bottle shops.</p><button class="button dark wide" data-find-stores>Use my current location <span>◎</span></button><p id="map-status" class="map-status">Location permission is required.</p><div id="shop-map" aria-label="Map of nearby wine shops"></div><div id="shop-list" class="shop-list"></div></main>`; }
function routeFinder(){ return `<main class="page route-page"><button class="back" data-go="home">← Home</button><p class="kicker">A better stop</p><h1>Wine that’s<br/><em>already on your way.</em></h1><p class="route-intro">Start from where you are. Add a destination and we’ll look for bottle shops close to your route.</p><form id="route-form" class="route-form"><label for="route-destination">Where are you heading?</label><div><input id="route-destination" name="destination" type="text" autocomplete="street-address" placeholder="Address, town or postcode" required><button class="button dark" type="submit">Find my route</button></div></form><p id="route-status" class="map-status" role="status" aria-live="polite">Your location is only used for this search.</p><div id="route-map" aria-label="Map showing bottle shops along your route"></div><div id="route-list" class="shop-list route-list"></div>${warning()}</main>`; }
function producers(){ return `<main class="page producers-page"><button class="back" data-go="home">← Home</button><p class="kicker">Closer to the source</p><h1>Meet the makers.<br/><em>Keep value local.</em></h1><p class="producer-intro">Buying direct can mean fewer markups for you and more of the price going to the producer.</p><div class="producer-promise"><span>Shorter journey</span><span>Direct connection</span><span>Local value</span></div><button class="button dark wide" data-find-producers>Find producers near me <span>◎</span></button><p id="producer-status" class="map-status" role="status" aria-live="polite">We’ll use your current location once.</p><div id="producer-map" aria-label="Map of nearby wine producers"></div><div id="producer-list" class="shop-list producer-list"></div>${warning()}</main>`; }
function impact(){ return `<main class="page impact-page"><p class="kicker">Your LooVin impact</p><h1>Good bottles<br/><em>come back.</em></h1><p class="impact-intro">The biggest impact often happens before the first pour. LooVin helps shorten the journey and keep bottles in use.</p><section class="waste-story"><figure><img src="/images/discarded-glass-bottles.jpg" width="1200" height="675" loading="lazy" alt="Workers sorting discarded glass bottles at a recycling facility"><figcaption>Discarded glass still has a long journey ahead.</figcaption></figure><div><h2>Don’t let one pour be the end.</h2><p>Thrown-away glass must be collected, sorted, crushed and remade. Where a return system exists, reuse can keep a bottle doing the same job.</p><strong>Return when you can. Recycle when you can’t.</strong></div></section><section class="impact-journey"><div class="impact-journey-head"><h2>What shapes an order</h2><span>From source to sip</span></div><article><b>High impact</b><div><strong>Long-distance transport</strong><p>The farther wine travels, the more energy the journey can use.</p></div></article><article><b>High impact</b><div><strong>Glass bottle + packaging</strong><p>Heavy glass and single-use packing add more material and weight.</p></div></article><article class="upstream"><b>Upstream</b><div><strong>Water + local producers</strong><p>How wine is grown matters. Buying closer keeps more value with local makers.</p></div></article></section><div class="return-counters"><div class="impact-number"><strong>${state.returned}</strong><span>bottles returned</span></div><div class="refund-number"><strong>€${state.refund.toFixed(2)}</strong><span>deposit refunded</span></div></div><div class="impact-card"><span>Glass kept in use</span><strong>${state.returned*500}g</strong><p>Each demo return refunds €0.50. The refund is never converted into store credit.</p></div><button class="button dark wide" data-return>Scan return QR <span>+ €0.50</span></button><p id="return-status" class="micro">Demo mode: press the button to scan one returned bottle.</p>${warning()}</main>`; }
function bind(){ document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{state.page=b.dataset.go;render()}); document.querySelectorAll('[data-age]').forEach(b=>b.onclick=()=>{if(b.dataset.age==='yes'){state.age=true;localStorage.setItem('loovin-age','yes');render()}else $('#app').innerHTML='<main class="gate"><h1>Thanks for checking.</h1><p>LooVin is for adults only.</p></main>'}); document.querySelectorAll('[data-wine]').forEach(b=>b.onclick=()=>{state.selected=wines.find(w=>w.id===b.dataset.wine);state.page='detail';render()}); $('[data-demo]')?.addEventListener('click',()=>openWine(DEMO_WINE_ID));
  $('[data-return]')?.addEventListener('click',()=>{state.returned++;state.refund=Number((state.refund+.5).toFixed(2));saveReturns();render()});
  $('[data-checkout]')?.addEventListener('click',()=>{state.page='checkout';render()});
  $('[data-place-order]')?.addEventListener('click',()=>{state.orders++;try{localStorage.setItem('loovin-orders',state.orders)}catch{}state.page='confirmation';render()});
  document.querySelectorAll('[data-back-detail]').forEach(button=>button.addEventListener('click',()=>{state.page='detail';render()}));
  $('[data-nearby]')?.addEventListener('click',()=>{state.page='stores';render();findNearbyStores()});
  $('[data-find-stores]')?.addEventListener('click',findNearbyStores);
  $('[data-find-producers]')?.addEventListener('click',findNearbyProducers);
  $('#route-form')?.addEventListener('submit',event=>{event.preventDefault();findRouteStores(new FormData(event.currentTarget).get('destination').trim())});
  $('[data-start-quiz]')?.addEventListener('click',()=>{state.quizStep=0;state.quizAnswers=[];state.page='quiz';render()});
  $('[data-quiz-back]')?.addEventListener('click',()=>{if(state.quizStep===0){state.page='home'}else{state.quizStep--}render()});
  document.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>{state.quizAnswers[state.quizStep]=quizQuestions[state.quizStep].options[Number(button.dataset.answer)].scores;if(state.quizStep===quizQuestions.length-1){finishQuiz()}else{state.quizStep++;render()}}));
  $('[data-demo-quiz]')?.addEventListener('click',()=>{state.quizAnswers=quizQuestions.map(question=>question.options[1].scores);finishQuiz()});
  $('[data-restart-quiz]')?.addEventListener('click',()=>{state.quizStep=0;state.quizAnswers=[];state.page='quiz';render()});
  const scanButton = $('[data-scan-file]'); const scanFile = $('#scan-file');
  scanButton?.addEventListener('click', () => scanFile.click());
  scanFile?.addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; const status = $('#scan-status'); const results = $('#scan-results'); status.textContent = 'Reading the label…'; results.innerHTML = '<p class="scan-note">Comparing bottle details…</p>';
    window.setTimeout(() => openWine(DEMO_WINE_ID), 650);
  });
}
let mapsPromise;
function loadGoogleMaps(){
  if(window.google?.maps) return Promise.resolve(window.google.maps);
  if(mapsPromise) return mapsPromise;
  const key=import.meta.env.config_GM_API_KEY;
  if(!key) return Promise.reject(new Error('Google Maps is not configured yet. Add config_GM_API_KEY in Vercel.'));
  mapsPromise=new Promise((resolve,reject)=>{
    window.__loovinMapsReady=()=>resolve(window.google.maps);
    const script=document.createElement('script');
    script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__loovinMapsReady`;
    script.async=true; script.onerror=()=>reject(new Error('Google Maps could not load. Check the API key and enabled APIs.'));
    document.head.appendChild(script);
  });
  return mapsPromise;
}
function currentLocation(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(new Error('Location is not supported by this browser.'));return;}
    navigator.geolocation.getCurrentPosition(position=>resolve({lat:position.coords.latitude,lng:position.coords.longitude}),()=>reject(new Error('Location access was not allowed. Enable it in your browser and try again.')),{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
  });
}
async function findNearbyStores(){
  const status=$('#map-status'); const mapElement=$('#shop-map'); const list=$('#shop-list');
  if(!status||!mapElement||!list) return;
  status.textContent='Getting your location…'; list.innerHTML='';
  try{
    const center=await currentLocation(); status.textContent='Finding nearby wine shops…';
    const maps=await loadGoogleMaps();
    const [{Map},{Place,SearchNearbyRankPreference},{AdvancedMarkerElement}]=await Promise.all([maps.importLibrary('maps'),maps.importLibrary('places'),maps.importLibrary('marker')]);
    const map=new Map(mapElement,{center,zoom:14,mapId:'DEMO_MAP_ID',mapTypeControl:false,streetViewControl:false,fullscreenControl:false});
    new AdvancedMarkerElement({map,position:center,title:'Your location'});
    const {places}=await Place.searchNearby({fields:['displayName','location','formattedAddress','googleMapsURI','rating'],locationRestriction:{center,radius:5000},includedPrimaryTypes:['liquor_store'],maxResultCount:6,rankPreference:SearchNearbyRankPreference.DISTANCE});
    if(!places.length){status.textContent='No wine shops were found within 5 km.';return;}
    status.textContent=`${places.length} nearby shops found`;
    const bounds=new maps.LatLngBounds(center);
    places.forEach((place,index)=>{
      if(place.location){new AdvancedMarkerElement({map,position:place.location,title:place.displayName});bounds.extend(place.location);}
      const link=document.createElement('a'); link.className='shop-result'; link.href=place.googleMapsURI||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName)}`; link.target='_blank'; link.rel='noreferrer';
      const number=document.createElement('span'); number.textContent=String(index+1).padStart(2,'0');
      const copy=document.createElement('span'); const name=document.createElement('strong'); name.textContent=place.displayName||'Wine shop'; const address=document.createElement('small'); address.textContent=place.formattedAddress||'Open in Google Maps'; copy.append(name,address);
      const rating=document.createElement('b'); rating.textContent=place.rating?`${place.rating.toFixed(1)} ★`:'Map'; link.append(number,copy,rating); list.appendChild(link);
    });
    map.fitBounds(bounds,70);
  }catch(error){status.textContent=error.message;mapElement.innerHTML='';}
}
function pointLiteral(point){
  return {lat:typeof point.lat==='function'?point.lat():point.lat,lng:typeof point.lng==='function'?point.lng():point.lng};
}
function placeKey(place){ return place.id||`${place.displayName}-${place.formattedAddress}`; }
function mapsDirectionUrl(origin,destination,stop){
  const start=`${origin.lat},${origin.lng}`;
  const waypoint=pointLiteral(stop.location);
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(start)}&destination=${encodeURIComponent(destination)}&travelmode=driving&waypoints=${encodeURIComponent(`${waypoint.lat},${waypoint.lng}`)}`;
}
function appendPlaceResult(list,place,index,{action='Open in Maps',href}={}){
  const link=document.createElement('a');
  link.className='shop-result'; link.href=href||place.googleMapsURI||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName||'wine')}`; link.target='_blank'; link.rel='noreferrer';
  const number=document.createElement('span'); number.textContent=String(index+1).padStart(2,'0');
  const copy=document.createElement('span'); const name=document.createElement('strong'); name.textContent=place.displayName||'Wine stop'; const address=document.createElement('small'); address.textContent=place.formattedAddress||'Open in Google Maps'; copy.append(name,address);
  const label=document.createElement('b'); label.textContent=action; link.append(number,copy,label); list.appendChild(link);
}
async function findNearbyProducers(){
  const status=$('#producer-status'); const mapElement=$('#producer-map'); const list=$('#producer-list');
  if(!status||!mapElement||!list) return;
  status.textContent='Getting your location…'; list.innerHTML='';
  try{
    const center=await currentLocation(); status.textContent='Finding producers near you…';
    const maps=await loadGoogleMaps();
    const [{Map:GoogleMap},{Place,SearchNearbyRankPreference},{AdvancedMarkerElement}]=await Promise.all([maps.importLibrary('maps'),maps.importLibrary('places'),maps.importLibrary('marker')]);
    const map=new GoogleMap(mapElement,{center,zoom:9,mapId:'DEMO_MAP_ID',mapTypeControl:false,streetViewControl:false,fullscreenControl:false});
    new AdvancedMarkerElement({map,position:center,title:'Your location'});
    const {places}=await Place.searchNearby({fields:['id','displayName','location','formattedAddress','googleMapsURI'],locationRestriction:{center,radius:50000},includedPrimaryTypes:['winery'],maxResultCount:8,rankPreference:SearchNearbyRankPreference.DISTANCE});
    if(!places.length){status.textContent='No wine producers were found within 50 km. Try again from a wine-growing area.';return;}
    status.textContent=`${places.length} local producers found`;
    const bounds=new maps.LatLngBounds(center);
    places.forEach((place,index)=>{
      if(place.location){new AdvancedMarkerElement({map,position:place.location,title:place.displayName});bounds.extend(place.location);}
      appendPlaceResult(list,place,index,{action:'Connect'});
    });
    map.fitBounds(bounds,60);
  }catch(error){status.textContent=error.message;mapElement.innerHTML='';}
}
async function findRouteStores(destination){
  const status=$('#route-status'); const mapElement=$('#route-map'); const list=$('#route-list');
  if(!status||!mapElement||!list||!destination) return;
  status.textContent='Getting your location…'; list.innerHTML=''; mapElement.innerHTML='';
  try{
    const origin=await currentLocation(); status.textContent='Mapping your route…';
    const maps=await loadGoogleMaps();
    const [{Map:GoogleMap},{Place,SearchNearbyRankPreference},{AdvancedMarkerElement}]=await Promise.all([maps.importLibrary('maps'),maps.importLibrary('places'),maps.importLibrary('marker')]);
    const map=new GoogleMap(mapElement,{center:origin,zoom:11,mapId:'DEMO_MAP_ID',mapTypeControl:false,streetViewControl:false,fullscreenControl:false});
    let routePath=[]; let routeDistance=0; let exactRoute=true;
    try{
      const {Route}=await maps.importLibrary('routes');
      const response=await Route.computeRoutes({origin,destination,travelMode:'DRIVING',routingPreference:'TRAFFIC_UNAWARE',polylineQuality:'OVERVIEW',fields:['path','viewport','distanceMeters']});
      const route=response.routes?.[0];
      if(!route) throw new Error('No driving route found.');
      routePath=route.path.map(pointLiteral); routeDistance=route.distanceMeters||0;
      route.createPolylines({polylineOptions:{strokeColor:'#72001f',strokeOpacity:.9,strokeWeight:5}}).forEach(polyline=>polyline.setMap(map));
      if(route.viewport) map.fitBounds(route.viewport,55);
    }catch(routeError){
      exactRoute=false;
      const {places:destinations}=await Place.searchByText({textQuery:destination,fields:['displayName','location'],maxResultCount:1});
      if(!destinations?.[0]?.location) throw routeError;
      routePath=[origin,pointLiteral(destinations[0].location)];
      new maps.Polyline({map,path:routePath,strokeColor:'#72001f',strokeOpacity:.75,strokeWeight:4});
      const bounds=new maps.LatLngBounds(origin); bounds.extend(routePath[1]); map.fitBounds(bounds,55);
    }
    const sampleIndexes=routePath.length>2?[.2,.5,.8].map(fraction=>Math.min(routePath.length-1,Math.floor((routePath.length-1)*fraction))):[0,1];
    const samples=[...new Set(sampleIndexes)].map(index=>routePath[index]);
    const batches=await Promise.all(samples.map((center,sampleIndex)=>Place.searchNearby({fields:['id','displayName','location','formattedAddress','googleMapsURI'],locationRestriction:{center,radius:3500},includedPrimaryTypes:['liquor_store'],maxResultCount:5,rankPreference:SearchNearbyRankPreference.DISTANCE}).then(({places})=>places.map((place,rank)=>({place,score:sampleIndex*10+rank}))).catch(()=>[])));
    const unique=new Map();
    batches.flat().sort((a,b)=>a.score-b.score).forEach(result=>{const key=placeKey(result.place);if(!unique.has(key))unique.set(key,result.place)});
    const places=[...unique.values()].slice(0,6);
    if(!places.length){status.textContent='No bottle shops were found close to this route.';return;}
    places.forEach((place,index)=>{
      if(place.location)new AdvancedMarkerElement({map,position:place.location,title:place.displayName});
      appendPlaceResult(list,place,index,{action:'Add stop',href:mapsDirectionUrl(origin,destination,place)});
    });
    const distance=routeDistance?` on your ${Math.round(routeDistance/1000)} km route`:'';
    status.textContent=`${places.length} bottle stops found${distance}${exactRoute?'':'. Route shown is approximate'}.`;
  }catch(error){status.textContent=error.message||'This route could not be mapped. Check the destination and try again.';mapElement.innerHTML='';}
}
function openWine(id){ const wine=wines.find(item=>item.id===id); if(wine){state.selected=wine;state.page='detail';render();} }
render();
