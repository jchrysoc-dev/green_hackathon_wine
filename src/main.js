import './style.css';
import './quiz.css';
import './commerce.css';
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
const storedNumber = (key) => { try { return Number(localStorage.getItem(key) || 0); } catch { return 0; } };
const state = { page: 'home', selected: null, age: localStorage.getItem('tasteme-age') === 'yes', tasted: false, returned: storedNumber('tasteme-returned'), refund: storedNumber('tasteme-refund'), orders: storedNumber('tasteme-orders'), quizStep: 0, quizAnswers: [], quizProfile: null };
const $ = (s) => document.querySelector(s);
const saveReturns = () => { try { localStorage.setItem('tasteme-returned', state.returned); localStorage.setItem('tasteme-refund', state.refund.toFixed(2)); } catch {} };

function shell(content) {
  return `<div class="app-shell"><header class="topbar"><button class="brand" aria-label="TasteMe home">taste<span>me</span></button><button class="impact" data-go="impact">${state.returned} bottles back in use <i>↗</i></button></header>${content}<nav class="dock"><button class="active" data-go="home"><span>⌂</span>Home</button><button data-go="scan"><span>◎</span>Scan</button><button data-go="impact"><span>↺</span>My impact</button></nav></div>`;
}
function warning(){ return `<p class="legal">L'abus d'alcool est dangereux pour la santé, à consommer avec modération.</p>`; }
function render(){
  if(!state.age){
    $('#app').innerHTML = `<main class="gate"><div class="gate-mark">tm</div><p class="kicker">A little more taste, a little less guesswork</p><h1>Find a bottle<br/><em>that fits.</em></h1><p class="gate-copy">A simple guide to wines you’ll actually enjoy — matched to your palate, not a shelf label.</p><div class="gate-card"><strong>Avez-vous 18 ans ou plus ?</strong><small>Required to enter TasteMe in France.</small><div class="gate-actions"><button class="button dark" data-age="yes">Over 18 — enter</button><button class="button outline" data-age="no">Under 18</button></div></div></main>`;
    bind();
    return;
  }
  let content = state.page==='home' ? home() : state.page==='scan' ? scan() : state.page==='quiz' ? quiz() : state.page==='results' ? results() : state.page==='checkout' ? checkout() : state.page==='confirmation' ? confirmation() : state.page==='stores' ? stores() : state.page==='impact' ? impact() : detail();
  $('#app').innerHTML = shell(content); bind();
}
function home(){ const match=wines.find(w=>w.id==='southbank-merlot'); return `<main class="page home"><div class="notice">La vente d'alcool aux mineurs est interdite.</div><section class="hero"><p class="kicker">Your next good bottle</p><h1>Wine, without<br/><em>the noise.</em></h1><p>Tell us what you like. We’ll do the shelf talk.</p><button class="button dark wide" data-go="scan">Scan a bottle <span>→</span></button><button class="text-button" data-start-quiz>or start with a taste quiz</button></section><section class="feature"><div class="feature-copy"><p class="kicker">Picked for a soft, fruity palate</p><h2>${match.name}</h2><p class="muted">${match.tags.join(' · ')} · ${match.region}</p><button class="button pale" data-wine="${match.id}">See why it fits</button></div><div class="bottle-art"><div class="bottle-neck"></div><div class="bottle-body"><span>TM</span><b>AUSTRALIA</b><small>soft red</small></div></div></section><section class="how"><p class="kicker">Three small steps</p><div class="steps"><div><b>01</b><strong>Scan</strong><span>the bottle in front of you</span></div><div><b>02</b><strong>Match</strong><span>your taste to the catalogue</span></div><div><b>03</b><strong>Return</strong><span>the reusable one when done</span></div></div></section>${warning()}</main>`; }
function scan(){ return `<main class="page scan"><p class="kicker">The bottle in front of you</p><h1>Let’s see<br/><em>what it is.</em></h1><div class="scanner"><div class="scan-line"></div><div class="scan-corners"></div><span>Point your camera at the label</span></div><button class="button dark wide" data-scan-file>Take or choose a photo</button><input id="scan-file" type="file" accept="image/*" capture="environment" hidden><button class="button outline wide" data-demo>Use demo bottle</button><p id="scan-status" class="micro">Demo recognition runs on this device. Your photo is never uploaded.</p><div id="scan-results"></div></main>`; }
function quiz(){
  const q = quizQuestions[state.quizStep];
  const progress = quizQuestions.map((_, index) => `<i class="${index <= state.quizStep ? 'filled' : ''}"></i>`).join('');
  return `<main class="page quiz-page"><div class="quiz-top"><button class="back" data-quiz-back>${state.quizStep ? '← Previous' : '← Home'}</button><span>${state.quizStep + 1} of ${quizQuestions.length}</span></div><div class="quiz-progress" aria-label="Question ${state.quizStep + 1} of ${quizQuestions.length}">${progress}</div><section class="quiz-question"><p class="kicker">Your taste, translated</p><h1>${q.question}</h1><p>${q.hint}</p><div class="quiz-options">${q.options.map((option,index)=>`<button data-answer="${index}"><strong>${option.label}</strong><span>${option.note}</span></button>`).join('')}</div></section>${state.quizStep===0?'<button class="text-button" data-demo-quiz>Fill with demo answers</button>':''}</main>`;
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
  try { localStorage.setItem('tasteme-profile', JSON.stringify(state.quizProfile)); } catch {}
  state.page = 'results'; render();
}
function profileMatch(profile, flavour){
  const distance = Math.sqrt(Object.keys(profile).reduce((sum,trait)=>sum+Math.pow(profile[trait]-flavour[trait],2),0));
  return Math.max(70, Math.round(100-(distance/Math.sqrt(80))*100));
}
function detail(){ const w=state.selected||wines[1]; const identified=w.id===DEMO_WINE_ID; return `<main class="page detail"><button class="back" data-go="home">← Back</button><div class="detail-head"><div class="bottle-art large"><div class="bottle-neck"></div><div class="bottle-body"><span>MG</span><b>${identified?'AUSTRALIA':w.region}</b><small>${w.tags[0]}</small></div></div><div><p class="kicker">${w.producer}</p><h1>${w.name.replace('PLACEHOLDER – ','')}</h1><p class="muted">${w.region} · ${w.colour} · €${w.price_eur.toFixed(2)}</p></div></div><div class="match"><strong>${identified?'Found':'92%'}</strong><span>${identified?'bottle identified':'match for your palate'}</span><p>${identified?w.description:'Light and fruity, with the same fresh red-fruit character you tend to like.'}</p></div><div class="facts"><div><span>Style</span><b>${w.tags.join(', ')}</b></div><div><span>With</span><b>${w.pairings.slice(0,2).join(' or ')}</b></div><div><span>Bottle</span><b>${w.bottle.type}${w.bottle.deposit_eur ? ` · €${w.bottle.deposit_eur.toFixed(2)} deposit` : ''}</b></div></div><button class="button dark wide" data-checkout>Buy from producer · €${w.price_eur.toFixed(2)}</button><button class="button outline wide" data-nearby>Find a shop nearby</button>${warning()}</main>`; }
function checkout(){ const w=state.selected||wines.find(wine=>wine.id===DEMO_WINE_ID); const total=w.price_eur+w.bottle.deposit_eur; return `<main class="page checkout-page"><div class="notice">La vente d'alcool aux mineurs est interdite.</div><button class="back" data-back-detail>← Back to wine</button><p class="kicker">Demo checkout</p><h1>One bottle.<br/><em>No details needed.</em></h1><p class="checkout-intro">This is a simulated order. No payment or personal information will be collected.</p><section class="order-slip"><div><span>Wine</span><strong>${w.name}</strong></div><div><span>Bottle</span><strong>€${w.price_eur.toFixed(2)}</strong></div>${w.bottle.deposit_eur?`<div><span>Refundable deposit</span><strong>€${w.bottle.deposit_eur.toFixed(2)}</strong></div>`:''}<div class="order-total"><span>Demo total</span><strong>€${total.toFixed(2)}</strong></div></section><div class="breathalyser"><strong>Éthylotests are available</strong><p>Breathalysers are available from pharmacies and road-safety retailers.</p></div><button class="button dark wide" data-place-order>Place demo order <span>→</span></button>${warning()}</main>`; }
function confirmation(){ const w=state.selected||wines.find(wine=>wine.id===DEMO_WINE_ID); return `<main class="page confirmation-page"><div class="notice">La vente d'alcool aux mineurs est interdite.</div><div class="confirmation-mark">✓</div><p class="kicker">Demo order placed</p><h1>That’s<br/><em>confirmed.</em></h1><p>No payment was taken and no personal details were collected.</p><section class="order-slip"><div><span>Wine</span><strong>${w.name}</strong></div><div><span>Order</span><strong>TM-${String(state.orders).padStart(3,'0')}</strong></div></section><button class="button dark wide" data-go="home">Back to home <span>→</span></button>${warning()}</main>`; }
function stores(){ return `<main class="page stores-page"><button class="back" data-back-detail>← Back to wine</button><p class="kicker">Near you</p><h1>Find a bottle<br/><em>close by.</em></h1><p class="stores-intro">We’ll use your current location once to find nearby wine and bottle shops.</p><button class="button dark wide" data-find-stores>Use my current location <span>◎</span></button><p id="map-status" class="map-status">Location permission is required.</p><div id="shop-map" aria-label="Map of nearby wine shops"></div><div id="shop-list" class="shop-list"></div></main>`; }
function impact(){ return `<main class="page impact-page"><p class="kicker">Return a bottle</p><h1>Good bottles<br/><em>come back.</em></h1><div class="return-counters"><div class="impact-number"><strong>${state.returned}</strong><span>bottles returned</span></div><div class="refund-number"><strong>€${state.refund.toFixed(2)}</strong><span>deposit refunded</span></div></div><div class="impact-card"><span>Glass kept in use</span><strong>${state.returned*500}g</strong><p>Each demo return refunds €0.50. The refund is never converted into store credit.</p></div><button class="button dark wide" data-return>Scan return QR <span>+ €0.50</span></button><p id="return-status" class="micro">Demo mode: press the button to scan one returned bottle.</p>${warning()}</main>`; }
function bind(){ document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{state.page=b.dataset.go;render()}); document.querySelectorAll('[data-age]').forEach(b=>b.onclick=()=>{if(b.dataset.age==='yes'){state.age=true;localStorage.setItem('tasteme-age','yes');render()}else $('#app').innerHTML='<main class="gate"><h1>Thanks for checking.</h1><p>TasteMe is for adults only.</p></main>'}); document.querySelectorAll('[data-wine]').forEach(b=>b.onclick=()=>{state.selected=wines.find(w=>w.id===b.dataset.wine);state.page='detail';render()}); $('[data-demo]')?.addEventListener('click',()=>openWine(DEMO_WINE_ID));
  $('[data-return]')?.addEventListener('click',()=>{state.returned++;state.refund=Number((state.refund+.5).toFixed(2));saveReturns();render()});
  $('[data-checkout]')?.addEventListener('click',()=>{state.page='checkout';render()});
  $('[data-place-order]')?.addEventListener('click',()=>{state.orders++;try{localStorage.setItem('tasteme-orders',state.orders)}catch{}state.page='confirmation';render()});
  document.querySelectorAll('[data-back-detail]').forEach(button=>button.addEventListener('click',()=>{state.page='detail';render()}));
  $('[data-nearby]')?.addEventListener('click',()=>{state.page='stores';render();findNearbyStores()});
  $('[data-find-stores]')?.addEventListener('click',findNearbyStores);
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
  const key=import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if(!key) return Promise.reject(new Error('Google Maps is not configured yet. Add VITE_GOOGLE_MAPS_API_KEY in Vercel.'));
  mapsPromise=new Promise((resolve,reject)=>{
    window.__tastemeMapsReady=()=>resolve(window.google.maps);
    const script=document.createElement('script');
    script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__tastemeMapsReady`;
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
function openWine(id){ const wine=wines.find(item=>item.id===id); if(wine){state.selected=wine;state.page='detail';render();} }
render();
