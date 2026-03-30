// ============================================================
// WRONG NOTE — renderWrongNotes, filterWN, saveWrongAnswer, updateWrongNoteFilters
// ============================================================
function renderWrongNotes(){
  let filter='전체';
  const active=document.querySelector('.wn-filter.active');
  if(active)filter=active.textContent.replace(/\s*\(\d+\)/,'').trim();
  let list=wrongNotes;
  if(filter==='3회 이상 틀림')list=wrongNotes.filter(n=>n.count>=3);
  else if(filter!=='전체')list=wrongNotes.filter(n=>n.chapter&&n.chapter.includes(filter));
  if(list.length===0){
    document.getElementById('wrongnote-list').innerHTML=`<div style="text-align:center;padding:60px;color:var(--txt3);font-size:14px">🎉 오답이 없어요! 계속 학습해주세요</div>`;
    return;
  }
  document.getElementById('wrongnote-list').innerHTML=list.map(n=>`
    <div class="wn-item">
      <div class="wn-header"><div class="wn-q">${n.q}</div><div class="wn-tag">⚠️ ${n.count}회 틀림</div></div>
      <div class="wn-answers">
        <div class="wn-ans wrong-ans"><div class="ans-label">내 답 (오답)</div><div style="color:var(--txt2);font-size:13px">${n.myAns}</div></div>
        <div class="wn-ans right-ans"><div class="ans-label">정답</div><div style="color:#34d399;font-size:13px;font-weight:500">${n.correct}</div></div>
      </div>
      <div class="wn-memo">💡 <strong>해설:</strong> ${n.memo}</div>
    </div>
  `).join('');
}

function filterWN(el){
  document.querySelectorAll('.wn-filter').forEach(f=>f.classList.remove('active'));
  el.classList.add('active');
  renderWrongNotes();
}

function saveWrongAnswer(q, myAns, correctAns, chapterTitle){
  const exists=wrongNotes.findIndex(n=>n.q===q.q);
  if(exists>=0){wrongNotes[exists].count++;}
  else{wrongNotes.push({q:q.q,myAns,correct:correctAns,count:1,chapter:chapterTitle,memo:q.exp});}
  updateWrongNoteFilters();
}

function updateWrongNoteFilters(){
  const filters=document.querySelectorAll('.wn-filter');
  if(filters[0])filters[0].textContent=`전체 (${wrongNotes.length})`;
  const three=wrongNotes.filter(n=>n.count>=3).length;
  filters.forEach(f=>{if(f.textContent.startsWith('3회'))f.textContent=`3회 이상 틀림 (${three})`;});
}
