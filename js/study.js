// ============================================================
// STUDY — showStudy, renderStudyContent, loadSection, toggleTTS,
//          markChapterStudied, markChapterQuizDone
// ============================================================
let ttsPlaying = false;
let currentChapterIdx = 0;

function showStudy(idx){
  showPage('study');
  currentChapterIdx = idx;
  const ch=chapters[idx];
  document.getElementById('sidebar-chapter-title').textContent=`📖 ${ch.title}`;
  renderSidebar(idx, 0);
  renderSectionContent(idx, 0);
}

function renderSidebar(chIdx, activeIdx){
  const ch=chapters[chIdx];
  document.getElementById('sidebar-sections').innerHTML=ch.sections.map((s,i)=>`
    <div class="sidebar-item ${i===activeIdx?'active':''}" onclick="loadSection(this,${chIdx},${i})">
      <span class="si-num">0${i+1}</span>${s.title}${s.done?'<span class="si-check">✓</span>':''}
    </div>
  `).join('');
}

function loadSection(el, chIdx, secIdx){
  document.querySelectorAll('.sidebar-item').forEach(s=>s.classList.remove('active'));
  if(el) el.classList.add('active');
  renderSectionContent(chIdx, secIdx);
}

function renderSectionContent(chIdx, secIdx){
  const ch=chapters[chIdx];
  const sec=ch.sections[secIdx];
  const c=sec.content;
  if(!c){
    document.getElementById('study-content-area').innerHTML=`<div class="warn-box">콘텐츠 준비 중입니다.</div>`;
    return;
  }
  const ttsRaw=c.text.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  window._ttsRaw=ttsRaw;
  // 섹션 완료 표시
  chapters[chIdx].sections[secIdx].done=true;
  markChapterStudied(chIdx);

  document.getElementById('study-content-area').innerHTML=`
    <div class="study-title">${c.title}</div>
    <div class="study-subtitle">${ch.title} · SECTION 0${secIdx+1}</div>
    <div class="tts-bar">
      <button class="tts-btn" onclick="toggleTTS()"><span id="tts-icon">🔊</span><span id="tts-text">음성으로 듣기</span></button>
      <select class="tts-speed" id="tts-speed">
        <option value="0.8">0.8x 느리게</option>
        <option value="1.0" selected>1.0x 보통</option>
        <option value="1.2">1.2x 빠르게</option>
        <option value="1.5">1.5x 매우빠름</option>
      </select>
      <div class="tts-wave hidden" id="tts-wave"><span></span><span></span><span></span><span></span><span></span></div>
      <span class="tts-label" id="tts-status">이 섹션을 음성으로 들을 수 있습니다</span>
    </div>
    <div class="study-text" id="tts-content">${c.text}</div>
    ${c.info?`<div class="info-box"><span class="tip-label blue">💡 핵심 포인트</span>${c.info}</div>`:''}
    ${c.warn?`<div class="warn-box"><span class="tip-label red">⚠️ 주의사항</span>${c.warn}</div>`:''}
    ${c.keyterms&&c.keyterms.length?`
      <div class="section-title" style="margin-top:24px">핵심 용어 정리</div>
      <div class="key-terms">${c.keyterms.map(t=>`<div class="key-term"><div class="kt-name">${t.name}</div><div class="kt-def">${t.def}</div></div>`).join('')}</div>
    `:''}
    <div class="study-actions">
      <button class="btn btn-primary" onclick="startChapterQuiz(${chIdx})">⚡ 챕터 퀴즈 풀기</button>
      <button class="btn btn-ghost" onclick="showPage('ai')">🤖 AI에게 질문하기</button>
    </div>
  `;
}

function renderStudyContent(ch){
  const idx=chapters.indexOf(ch);
  renderSectionContent(idx, 0);
}

function toggleTTS(){
  const speed=parseFloat(document.getElementById('tts-speed')?.value||1.0);
  const wave=document.getElementById('tts-wave');
  const btnText=document.getElementById('tts-text');
  const icon=document.getElementById('tts-icon');
  const status=document.getElementById('tts-status');
  if(ttsPlaying){speechSynthesis.cancel();ttsPlaying=false;wave.classList.add('hidden');btnText.textContent='음성으로 듣기';icon.textContent='🔊';status.textContent='이 섹션을 음성으로 들을 수 있습니다';return;}
  if(!('speechSynthesis' in window)){status.textContent='이 브라우저는 음성을 지원하지 않습니다';return;}
  const rawText=window._ttsRaw||document.getElementById('tts-content')?.innerText||'';
  const utt=new SpeechSynthesisUtterance(rawText);
  utt.lang='ko-KR';utt.rate=speed;
  utt.onstart=()=>{ttsPlaying=true;wave.classList.remove('hidden');btnText.textContent='중지';icon.textContent='⏹';status.textContent='재생 중...';};
  utt.onend=()=>{ttsPlaying=false;wave.classList.add('hidden');btnText.textContent='음성으로 듣기';icon.textContent='🔊';status.textContent='재생 완료';};
  utt.onerror=()=>{ttsPlaying=false;wave.classList.add('hidden');};
  speechSynthesis.speak(utt);
}

function markChapterStudied(idx){
  if(chapters[idx].prog===0){
    chapters[idx].prog=30;
    chapters[idx].status='🔄 학습중';
  }
  updateDashboard();
}

function markChapterQuizDone(idx, pct){
  chapters[idx].prog=pct>=80?100:Math.max(chapters[idx].prog, 60);
  if(pct>=80){chapters[idx].status='✅ 완료';}
  else{chapters[idx].status='🔄 학습중';}
  updateDashboard();
  renderChapters();
}
