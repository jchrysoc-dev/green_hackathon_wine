import './style.css';
import './quiz.css';
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
const state = { page: 'home', selected: null, age: localStorage.getItem('tasteme-age') === 'yes', tasted: false, returned: Number(localStorage.getItem('tasteme-returned') || 0), quizStep: 0, quizAnswers: [], quizProfile: null };
const $ = (s) => document.querySelector(s);
const save = () => localStorage.setItem('tasteme-returned', state.returned);

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
  let content = state.page==='home' ? home() : state.page==='scan' ? scan() : state.page==='quiz' ? quiz() : state.page==='results' ? results() : state.page==='impact' ? impact() : detail();
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
function detail(){ const w=state.selected||wines[1]; const identified=w.id===DEMO_WINE_ID; return `<main class="page detail"><button class="back" data-go="home">← Back</button><div class="detail-head"><div class="bottle-art large"><div class="bottle-neck"></div><div class="bottle-body"><span>MG</span><b>${identified?'AUSTRALIA':w.region}</b><small>${w.tags[0]}</small></div></div><div><p class="kicker">${w.producer}</p><h1>${w.name.replace('PLACEHOLDER – ','')}</h1><p class="muted">${w.region} · ${w.colour} · €${w.price_eur.toFixed(2)}</p></div></div><div class="match"><strong>${identified?'Found':'92%'}</strong><span>${identified?'bottle identified':'match for your palate'}</span><p>${identified?w.description:'Light and fruity, with the same fresh red-fruit character you tend to like.'}</p></div><div class="facts"><div><span>Style</span><b>${w.tags.join(', ')}</b></div><div><span>With</span><b>${w.pairings.slice(0,2).join(' or ')}</b></div><div><span>Bottle</span><b>${w.bottle.type}${w.bottle.deposit_eur ? ` · €${w.bottle.deposit_eur.toFixed(2)} deposit` : ''}</b></div></div><button class="button dark wide" data-order>Buy from producer · €${w.price_eur.toFixed(2)}</button><button class="button outline wide" data-go="home">Find a shop nearby</button>${warning()}</main>`; }
function impact(){ return `<main class="page impact-page"><p class="kicker">Your small circle</p><h1>Good bottles<br/><em>come back.</em></h1><div class="impact-number"><strong>${state.returned}</strong><span>bottles returned</span></div><div class="impact-card"><span>Glass kept in use</span><strong>${state.returned*500}g</strong><p>Return a reusable bottle and the deposit is refunded — never store credit.</p></div><button class="button dark wide" data-return>Scan a return QR</button><p class="micro">Demo mode: this marks one bottle as returned.</p>${warning()}</main>`; }
function bind(){ document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{state.page=b.dataset.go;render()}); document.querySelectorAll('[data-age]').forEach(b=>b.onclick=()=>{if(b.dataset.age==='yes'){state.age=true;localStorage.setItem('tasteme-age','yes');render()}else $('#app').innerHTML='<main class="gate"><h1>Thanks for checking.</h1><p>TasteMe is for adults only.</p></main>'}); document.querySelectorAll('[data-wine]').forEach(b=>b.onclick=()=>{state.selected=wines.find(w=>w.id===b.dataset.wine);state.page='detail';render()}); $('[data-demo]')?.addEventListener('click',()=>openWine(DEMO_WINE_ID)); $('[data-return]')?.addEventListener('click',()=>{state.returned++;save();render()}); $('[data-order]')?.addEventListener('click',()=>{alert('Demo order placed. No payment was taken.');});
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
function openWine(id){ const wine=wines.find(item=>item.id===id); if(wine){state.selected=wine;state.page='detail';render();} }
render();
