// ============================================================
// EXAM — selectExamType, startExam, startExamTimer, renderExamQuestion,
//         selectExamOpt, examNextQuestion, finishExam, confirmExitExam, resetExam
// ============================================================
let examQuestions = [];
let examCurrentQ = 0;
let examScore = 0;
let examAnswered = false;
let examTimerInterval = null;
let examTimeLeft = 0;

function selectExamType(el){
  document.querySelectorAll('.exam-opt-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
}

function startExam(){
  const countVal=parseInt(document.getElementById('exam-count').value);
  const timeVal=parseInt(document.getElementById('exam-time').value);
  // 문제 풀에서 랜덤 선택
  const shuffled=[...examPool].sort(()=>Math.random()-0.5);
  examQuestions=shuffled.slice(0,Math.min(countVal,shuffled.length));
  examCurrentQ=0; examScore=0; examAnswered=false;
  examTimeLeft=timeVal*60;
  document.getElementById('exam-lobby-screen').style.display='none';
  document.getElementById('exam-question-screen').style.display='block';
  document.getElementById('exam-result-screen').style.display='none';
  renderExamQuestion();
  startExamTimer();
}

function startExamTimer(){
  clearInterval(examTimerInterval);
  examTimerInterval=setInterval(()=>{
    examTimeLeft--;
    const m=Math.floor(examTimeLeft/60).toString().padStart(2,'0');
    const s=(examTimeLeft%60).toString().padStart(2,'0');
    const el=document.getElementById('exam-timer');
    if(el)el.textContent=`${m}:${s}`;
    if(examTimeLeft<=60&&el)el.style.color='var(--acc)';
    if(examTimeLeft<=0){clearInterval(examTimerInterval);finishExam();}
  },1000);
}

function renderExamQuestion(){
  const q=examQuestions[examCurrentQ];
  const total=examQuestions.length;
  document.getElementById('exam-q-counter').textContent=`문제 ${examCurrentQ+1} / ${total}`;
  document.getElementById('exam-q-num').textContent=`Q.${String(examCurrentQ+1).padStart(2,'0')}`;
  document.getElementById('exam-q-text').textContent=q.q;
  document.getElementById('exam-prog-bar').style.width=((examCurrentQ)/total*100)+'%';
  document.getElementById('exam-q-result').className='quiz-result';
  document.getElementById('exam-q-result').innerHTML='';
  document.getElementById('exam-next-btn').disabled=true;
  examAnswered=false;
  const examLetters=['A','B','C','D'];
  document.getElementById('exam-q-opts').innerHTML=q.opts.map((o,i)=>
    `<button class="quiz-opt" onclick="selectExamOpt(this,${i})"><span class="opt-letter">${examLetters[i]}</span>${o}</button>`
  ).join('');
}

function selectExamOpt(el,idx){
  if(examAnswered)return; examAnswered=true;
  const q=examQuestions[examCurrentQ];
  document.querySelectorAll('#exam-q-opts .quiz-opt').forEach((o,i)=>{
    o.disabled=true;
    if(i===q.answer)o.classList.add('correct');
    else if(i===idx&&idx!==q.answer)o.classList.add('wrong');
  });
  if(idx===q.answer){
    examScore++;
    document.getElementById('exam-q-result').className='quiz-result right show';
    document.getElementById('exam-q-result').innerHTML='✅ 정답! '+q.exp;
  } else {
    document.getElementById('exam-q-result').className='quiz-result wrong show';
    document.getElementById('exam-q-result').innerHTML='❌ 오답. '+q.exp;
  }
  const isLast=examCurrentQ===examQuestions.length-1;
  const btn=document.getElementById('exam-next-btn');
  btn.disabled=false;
  btn.textContent=isLast?'결과 보기 🏁':'다음 문제 →';
}

function examNextQuestion(){
  if(examCurrentQ<examQuestions.length-1){examCurrentQ++;renderExamQuestion();}
  else{finishExam();}
}

function finishExam(){
  clearInterval(examTimerInterval);
  const total=examQuestions.length;
  const pct=Math.round(examScore/total*100);
  document.getElementById('exam-question-screen').style.display='none';
  document.getElementById('exam-result-screen').style.display='block';
  document.getElementById('exam-result-icon').textContent=pct>=90?'🏆':pct>=70?'👍':'📚';
  document.getElementById('exam-score-display').textContent=pct+'점';
  document.getElementById('exam-detail-text').textContent=`${total}문항 중 ${examScore}문항 정답`;
}

function confirmExitExam(){
  if(confirm('시험을 종료하시겠습니까?')){clearInterval(examTimerInterval);resetExam();}
}

function resetExam(){
  clearInterval(examTimerInterval);
  document.getElementById('exam-lobby-screen').style.display='block';
  document.getElementById('exam-question-screen').style.display='none';
  document.getElementById('exam-result-screen').style.display='none';
  const timer=document.getElementById('exam-timer');
  if(timer){timer.textContent='40:00';timer.style.color='';}
}
