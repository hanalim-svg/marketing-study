// ============================================================
// AI TUTOR — Groq API chat
// ============================================================
const conversationHistory = [];

// URL 해시에서 API 키 자동 로드
(function(){
  const hash = window.location.hash;
  const match = hash.match(/[#&]key=([^&]+)/);
  if(match){
    const key = decodeURIComponent(match[1]).replace(/[^\x20-\x7E]/g,'');
    if(key) localStorage.setItem('grok_api_key', key);
    // 키를 URL에서 제거 (보안)
    history.replaceState(null,'',window.location.pathname+window.location.search);
  }
})();

function saveApiKey(){
  const key=document.getElementById('api-key-input').value.trim().replace(/[^\x20-\x7E]/g,'');
  if(!key){alert('API 키를 입력해주세요!');return;}
  localStorage.setItem('grok_api_key',key);
  document.getElementById('api-key-modal').style.display='none';
  addMsg('✅ Grok API 키가 저장되었습니다! 이제 무엇이든 물어보세요 🔧','ai');
}

function getApiKey(){return localStorage.getItem('grok_api_key')||'';}

function openApiModal(){document.getElementById('api-key-modal').style.display='flex';}
function closeApiModal(){document.getElementById('api-key-modal').style.display='none';}

async function sendChat(){
  const input=document.getElementById('chat-input');
  const msg=input.value.trim();
  if(!msg)return;
  const apiKey=getApiKey();
  if(!apiKey){openApiModal();return;}
  addMsg(msg,'user');
  input.value='';
  document.getElementById('chat-send-btn').disabled=true;
  conversationHistory.push({role:'user',content:msg});
  const typingId=addTyping();
  try{
    const resp=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({
        model:'llama-3.3-70b-versatile',
        max_tokens:1200,
        messages:[
          {role:'system',content:`당신은 대한민국 자동차 정비 전문 AI 튜터입니다.
사용자는 한국폴리텍 미래자동차과에 다니는 23살 안현규 학생으로, 실기는 잘하지만 이론이 약합니다.
담당 과목: 자동차 정비, 용접, 섀시, 도장 등.
역할:
- 엔진, 냉각, 윤활, 연료, 점화, 전기/전자, 섀시, 현가, 제동, 조향, 도장, 용접 등 모든 자동차 정비 이론 설명
- 어려운 용어는 쉽고 친근하게 설명
- 자동차 정비기능사 시험에 자주 나오는 내용 강조
- 핵심 포인트를 ✅, 💡, ⚠️ 이모지로 강조
- 현규씨라고 친근하게 호칭
- 한국어로 답변`},
          ...conversationHistory
        ]
      })
    });
    removeTyping(typingId);
    if(resp.ok){
      const data=await resp.json();
      const text=data.choices[0].message.content||'';
      conversationHistory.push({role:'assistant',content:text});
      addMsg(text,'ai');
    } else {
      if(resp.status===401){localStorage.removeItem('grok_api_key');addMsg('⚠️ API 키가 올바르지 않습니다. 다시 입력해주세요.','ai');openApiModal();}
      else{addMsg(`❌ 오류 (${resp.status}). 잠시 후 다시 시도해주세요! 🔧`,'ai');}
    }
  }catch(e){removeTyping(typingId);addMsg('🔌 오류: '+e.message,'ai');}
  document.getElementById('chat-send-btn').disabled=false;
}

function addMsg(text,role){
  const body=document.getElementById('chat-body');
  const div=document.createElement('div');
  div.className=`msg ${role==='user'?'user':''}`;
  div.innerHTML=`<div class="msg-ava">${role==='user'?'현':'🤖'}</div><div class="msg-bubble">${text.replace(/\n/g,'<br>')}</div>`;
  body.appendChild(div);body.scrollTop=body.scrollHeight;
}

function addTyping(){
  const body=document.getElementById('chat-body');
  const div=document.createElement('div');
  const id='typing-'+Date.now();div.id=id;div.className='msg';
  div.innerHTML=`<div class="msg-ava">🤖</div><div class="msg-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>`;
  body.appendChild(div);body.scrollTop=body.scrollHeight;return id;
}

function removeTyping(id){const el=document.getElementById(id);if(el)el.remove();}

function askQuick(text){document.getElementById('chat-input').value=text;sendChat();}

function copyShareLink(){
  const key=getApiKey();
  if(!key){alert('먼저 API 키를 입력해주세요!');openApiModal();return;}
  const base='https://hanalim-svg.github.io/marketing-study/autotech-academy.html';
  const url=base+'#key='+encodeURIComponent(key);
  navigator.clipboard.writeText(url).then(()=>{
    addMsg('🔗 공유 링크가 클립보드에 복사됐어요! 링크를 받은 사람은 API 키 없이 바로 사용할 수 있어요.','ai');
  }).catch(()=>{
    prompt('아래 링크를 복사하세요:',url);
  });
}
