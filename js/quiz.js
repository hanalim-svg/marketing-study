// ============================================================
// QUIZ — renderQuizSelectScreen, startChapterQuiz, renderQuizQuestion,
//         selectQuizOpt, showQuizHint, nextQuizQuestion,
//         fetchAIQuizQuestions, showQuizResult
// ============================================================
let quizChapterIdx = 0;
let quizQuestions = [];
let currentQ = 0;
let quizScore = 0;
let quizAnswered = false;

function renderQuizSelectScreen(){
  document.getElementById('quiz-select-screen').style.display='block';
  document.getElementById('quiz-play-screen').style.display='none';
  document.getElementById('quiz-chapter-select').innerHTML=chapters.map((ch,i)=>`
    <div class="chapter-card" onclick="startChapterQuiz(${i})" style="cursor:pointer">
      <div class="ch-num">CHAPTER ${ch.num}</div>
      <div class="ch-badge">${ch.status}</div>
      <div class="ch-title">${ch.title}</div>
      <div class="ch-bar"><div class="ch-fill" style="width:${ch.prog}%"></div></div>
      <div class="ch-prog"><span>진도 ${ch.prog}%</span><span style="color:var(--acc3);font-size:11px">퀴즈 풀기 →</span></div>
    </div>
  `).join('');
}

function startChapterQuiz(chIdx){
  quizChapterIdx=chIdx;
  quizQuestions=[...(chapterQuizData[chIdx]||[])];
  currentQ=0; quizScore=0; quizAnswered=false;
  showPage('quiz');
  document.getElementById('quiz-select-screen').style.display='none';
  document.getElementById('quiz-play-screen').style.display='block';
  renderQuizHeader();
  renderQuizQuestion();
}

function renderQuizHeader(){
  const ch=chapters[quizChapterIdx];
  document.getElementById('qprog-text').textContent=`1 / ${quizQuestions.length}`;
  document.getElementById('score-display').textContent='정답 0개';
  document.getElementById('score-display').className='score-badge good';
  // 상단에 챕터 이름 표시
  let titleEl=document.getElementById('quiz-chapter-title');
  if(!titleEl){
    const container=document.querySelector('.quiz-container');
    const div=document.createElement('div');
    div.id='quiz-chapter-title';
    div.style.cssText='font-size:13px;color:var(--acc3);margin-bottom:8px;letter-spacing:1px';
    container.insertBefore(div,container.firstChild);
  }
  document.getElementById('quiz-chapter-title').textContent=`📖 CHAPTER ${ch.num} · ${ch.title}`;
}

function renderQuizQuestion(){
  if(currentQ>=quizQuestions.length){showQuizResult();return;}
  const q=quizQuestions[currentQ];
  const total=quizQuestions.length;
  document.getElementById('qprog').style.width=((currentQ+1)/total*100)+'%';
  document.getElementById('qprog-text').textContent=`${currentQ+1} / ${total}`;
  // AI 생성 문제 표시
  const isAI=q.isAI===true;
  document.getElementById('quiz-area').innerHTML=`
    <div class="quiz-card">
      <div class="quiz-q">
        <span class="q-num">Q.${String(currentQ+1).padStart(2,'0')} ${isAI?'<span style="font-size:10px;background:rgba(0,210,255,0.15);border:1px solid rgba(0,210,255,0.3);border-radius:4px;padding:1px 6px;color:var(--acc3);margin-left:4px">🤖 AI</span>':''}</span>
        ${q.q}
      </div>
      <div class="quiz-options">${q.opts.map((o,i)=>`<button class="quiz-opt" onclick="selectQuizOpt(this,${i})"><span class="opt-letter">${letters[i]}</span>${o}</button>`).join('')}</div>
      <div class="quiz-result" id="quiz-result"></div>
      <div class="quiz-nav">
        <button class="btn btn-secondary" id="hint-btn" onclick="showQuizHint()">💡 힌트</button>
        <button class="btn btn-primary" id="next-btn" onclick="nextQuizQuestion()" disabled>${currentQ===quizQuestions.length-1?'결과 보기 🏁':'다음 문제 →'}</button>
      </div>
    </div>`;
  quizAnswered=false;
}

function selectQuizOpt(el,idx){
  if(quizAnswered)return; quizAnswered=true;
  const q=quizQuestions[currentQ];
  document.querySelectorAll('.quiz-opt').forEach((o,i)=>{
    o.disabled=true;
    if(i===q.answer)o.classList.add('correct');
    else if(i===idx&&idx!==q.answer)o.classList.add('wrong');
  });
  const correct=idx===q.answer;
  if(correct){
    quizScore++;
    document.getElementById('quiz-result').className='quiz-result right show';
    document.getElementById('quiz-result').innerHTML='✅ 정답입니다! '+q.exp;
  } else {
    document.getElementById('quiz-result').className='quiz-result wrong show';
    document.getElementById('quiz-result').innerHTML='❌ 오답입니다. '+q.exp;
    // 오답 저장
    saveWrongAnswer(q, q.opts[idx], q.opts[q.answer], chapters[quizChapterIdx].title);
  }
  document.getElementById('score-display').textContent=`정답 ${quizScore}개`;
  document.getElementById('score-display').className=`score-badge ${quizScore/(currentQ+1)>=0.6?'good':'bad'}`;
  document.getElementById('next-btn').disabled=false;
  document.getElementById('hint-btn').style.display='none';
}

function showQuizHint(){
  const q=quizQuestions[currentQ];
  const res=document.getElementById('quiz-result');
  res.className='quiz-result hint show';
  res.innerHTML='💡 힌트: '+(q.hint||'천천히 보기를 다시 읽어보세요!');
}

function nextQuizQuestion(){
  if(currentQ<quizQuestions.length-1){
    currentQ++;
    // 고정 문제 다 끝나고 AI 문제 아직 없으면 생성
    const staticCount=(chapterQuizData[quizChapterIdx]||[]).length;
    if(currentQ===staticCount && quizQuestions.length===staticCount){
      fetchAIQuizQuestions();
      return;
    }
    renderQuizQuestion();
  } else {
    showQuizResult();
  }
}

async function fetchAIQuizQuestions(){
  const apiKey=getApiKey();
  const ch=chapters[quizChapterIdx];
  // 로딩 표시
  document.getElementById('quiz-area').innerHTML=`
    <div class="quiz-card" style="text-align:center;padding:40px">
      <div style="font-size:36px;margin-bottom:16px">🤖</div>
      <div style="font-family:var(--font-display);font-size:16px;color:var(--acc3);margin-bottom:8px">AI 문제 생성 중...</div>
      <div style="font-size:13px;color:var(--txt2)">${ch.title} 챕터 맞춤 문제를 만들고 있어요!</div>
      <div style="margin-top:16px"><span class="typing-dots"><span></span><span></span><span></span></span></div>
    </div>`;

  if(!apiKey){
    // API 키 없으면 바로 결과
    showQuizResult();
    return;
  }
  try{
    const resp=await fetch('https://api.x.ai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({
        model:'grok-3',
        max_tokens:800,
        messages:[
          {role:'system',content:'자동차 정비 시험 문제 출제자입니다. JSON만 응답하세요.'},
          {role:'user',content:`"${ch.title}" 챕터 내용(${ch.desc})을 바탕으로 4지선다 문제 2개를 만들어주세요.
반드시 아래 JSON 배열 형식만 출력하세요 (설명 없이):
[{"q":"문제","opts":["보기1","보기2","보기3","보기4"],"answer":정답인덱스(0~3),"exp":"해설"}]`}
        ]
      })
    });
    if(resp.ok){
      const data=await resp.json();
      const raw=data.choices[0].message.content||'';
      const match=raw.match(/\[[\s\S]*\]/);
      if(match){
        const aiQs=JSON.parse(match[0]);
        aiQs.forEach(q=>{q.isAI=true;quizQuestions.push(q);});
      }
    }
  }catch(e){}
  renderQuizQuestion();
}

function showQuizResult(){
  const total=quizQuestions.length;
  const pct=Math.round(quizScore/total*100);
  const chIdx=quizChapterIdx;
  const nextIdx=chIdx+1;
  const hasNext=nextIdx<chapters.length;
  // 챕터 완료 처리
  markChapterQuizDone(chIdx, pct);
  document.getElementById('quiz-area').innerHTML=`
    <div style="text-align:center;padding:40px;background:var(--card);border-radius:12px">
      <div style="font-size:56px;margin-bottom:16px">${pct>=80?'🏆':pct>=60?'👍':'📚'}</div>
      <div style="font-family:var(--font-display);font-size:48px;font-weight:900;color:var(--acc2);margin-bottom:8px">${pct}점</div>
      <div style="color:var(--txt2);font-size:14px;margin-bottom:6px">${total}문제 중 ${quizScore}문제 정답!</div>
      <div style="color:var(--txt3);font-size:12px;margin-bottom:24px">오답 ${total-quizScore}문제가 오답노트에 저장됐어요</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="startChapterQuiz(${chIdx})">🔄 다시 풀기</button>
        <button class="btn btn-secondary" onclick="showPage('wrongnote')">📋 오답노트</button>
        ${hasNext?`<button class="btn btn-primary" onclick="showStudy(${nextIdx})">다음 챕터 →</button>`:''}
      </div>
    </div>`;
}
