// ============================================================
// DASHBOARD — showPage, renderChapters, updateDashboard
// ============================================================
function showPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.getElementById('nav-'+page).classList.add('active');
  if(page==='wrongnote')renderWrongNotes();
  if(page==='quiz')renderQuizSelectScreen();
}

function renderChapters(){
  document.getElementById('chapter-grid').innerHTML=chapters.map(ch=>`
    <div class="chapter-card" onclick="showStudy(${chapters.indexOf(ch)})">
      <div class="ch-num">CHAPTER ${ch.num}</div>
      <div class="ch-badge">${ch.status}</div>
      <div class="ch-title">${ch.title}</div>
      <div class="ch-desc">${ch.desc}</div>
      <div class="ch-bar"><div class="ch-fill" style="width:${ch.prog}%"></div></div>
      <div class="ch-prog"><span>진도 ${ch.prog}%</span><span>${ch.prog===100?'🔥 마스터':ch.prog>0?'⚙️ 학습중':'🔒 대기중'}</span></div>
    </div>
  `).join('');
}

function updateDashboard(){
  const total=chapters.length;
  const done=chapters.filter(c=>c.prog===100).length;
  const avgProg=Math.round(chapters.reduce((s,c)=>s+c.prog,0)/total);
  const quizPassed=chapters.filter(c=>c.prog>=80).length;
  // hero stats
  const els={prog:document.querySelector('.hero-stat:nth-child(1) .num'),pt:document.querySelector('.hero-stat:nth-child(2) .num'),quiz:document.querySelector('.hero-stat:nth-child(3) .num'),wn:document.querySelector('.hero-stat:nth-child(4) .num')};
  if(els.prog)els.prog.textContent=avgProg+'%';
  if(els.pt)els.pt.textContent=quizPassed*30;
  if(els.quiz)els.quiz.textContent=quizPassed;
  if(els.wn)els.wn.textContent=wrongNotes.length;
  // stat cards
  const chCard=document.querySelector('.stat-card:nth-child(1) .value');
  const wnCard=document.querySelector('.stat-card:nth-child(4) .value');
  if(chCard)chCard.textContent=`${done} / ${total}`;
  if(wnCard)wnCard.textContent=wrongNotes.length+'문제';
  // 퀴즈 카드
  const quizCard=document.querySelector('.stat-card:nth-child(2) .value');
  if(quizCard)quizCard.textContent=quizPassed>0?quizPassed+'개 완료':'미완료';
}
