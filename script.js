/* Insta Proo — simple client-side chat demo (localStorage only) */
(function(){
  const SESSION_KEY = 'instaproo_user';
  const STORE_KEY   = 'instaproo_chats_v1';

  const avatar = (seed) => `https://i.pravatar.cc/120?u=${encodeURIComponent(seed)}`;

  const seedChats = (me) => ([
    {id:'c1', name:'emma.rose',     status:'Active now',          unread:2, messages:[
      {from:'them', text:'Hey! Did you see the new sunset pics? 🌅', t:Date.now()-1000*60*60*3},
      {from:'me',   text:'Yes! Absolutely stunning 😍',              t:Date.now()-1000*60*60*2.9},
      {from:'them', text:'We should plan a trip soon!',              t:Date.now()-1000*60*10},
      {from:'them', text:'Are you free this weekend?',               t:Date.now()-1000*60*4},
    ]},
    {id:'c2', name:'jay_designs',   status:'Active 12m ago',      unread:0, messages:[
      {from:'me',   text:'Sent over the new mockups 🎨', t:Date.now()-1000*60*60*24},
      {from:'them', text:'Love them. Approved ✅',       t:Date.now()-1000*60*60*23},
    ]},
    {id:'c3', name:'travel.daily',  status:'Active 1h ago',       unread:1, messages:[
      {from:'them', text:'New post just dropped — check it!', t:Date.now()-1000*60*60*5},
    ]},
    {id:'c4', name:'mike_codes',    status:'Active now',          unread:0, messages:[
      {from:'them', text:'Pushing the fix now 🚀', t:Date.now()-1000*60*60*8},
      {from:'me',   text:'Awesome, thanks!',       t:Date.now()-1000*60*60*7.9},
    ]},
    {id:'c5', name:'foodie.lia',    status:'Active 30m ago',      unread:0, messages:[
      {from:'them', text:'Try the new ramen place 🍜', t:Date.now()-1000*60*60*48},
    ]},
    {id:'c6', name:'sam.fit',       status:'Active 2h ago',       unread:0, messages:[
      {from:'me',   text:'See you at the gym 💪', t:Date.now()-1000*60*60*30},
    ]},
  ]).map(c => ({...c, avatar: avatar(c.name)}));

  /* ---------- LOGIN PAGE ---------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm){
    // already logged in? go straight to chats
    if (localStorage.getItem(SESSION_KEY)){
      window.location.replace('chat.html'); return;
    }
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const u = document.getElementById('username').value.trim() || 'guest';
      localStorage.setItem(SESSION_KEY, u);
      if (!localStorage.getItem(STORE_KEY)){
        localStorage.setItem(STORE_KEY, JSON.stringify(seedChats(u)));
      }
      window.location.href = 'chat.html';
    });
    document.querySelector('.btn-fb')?.addEventListener('click', ()=>{
      localStorage.setItem(SESSION_KEY, 'guest');
      if (!localStorage.getItem(STORE_KEY)){
        localStorage.setItem(STORE_KEY, JSON.stringify(seedChats('guest')));
      }
      window.location.href = 'chat.html';
    });
    document.getElementById('signupLink')?.addEventListener('click', (e)=>{
      e.preventDefault();
      alert('Sign up is not available in this demo — just log in with any name!');
    });
    return;
  }

  /* ---------- CHAT PAGE ---------- */
  const chatList   = document.getElementById('chatList');
  if (!chatList) return;

  const me        = localStorage.getItem(SESSION_KEY);
  if (!me){ window.location.replace('index.html'); return; }

  let chats = JSON.parse(localStorage.getItem(STORE_KEY) || 'null') || seedChats(me);
  let activeId = chats[0]?.id || null;

  const $ = (id)=>document.getElementById(id);
  $('meName').textContent = me;

  function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(chats)); }

  function fmtPreview(c){
    const last = c.messages[c.messages.length-1];
    if (!last) return 'Say hi 👋';
    return (last.from==='me' ? 'You: ' : '') + last.text;
  }

  function renderStories(){
    const row = $('storyRow');
    row.innerHTML = '';
    chats.forEach(c=>{
      const el = document.createElement('div');
      el.className = 'story';
      el.innerHTML = `<div class="story-ring"><img src="${c.avatar}" alt=""></div><span>${c.name}</span>`;
      el.addEventListener('click', ()=>openChat(c.id));
      row.appendChild(el);
    });
  }

  function renderList(filter=''){
    chatList.innerHTML = '';
    const f = filter.trim().toLowerCase();
    chats
      .filter(c => !f || c.name.toLowerCase().includes(f))
      .forEach(c=>{
        const li = document.createElement('li');
        li.className = 'chat-item' + (c.id===activeId ? ' active':'');
        li.innerHTML = `
          <img class="avatar" src="${c.avatar}" alt="">
          <div class="chat-meta">
            <p class="name">${c.name}</p>
            <p class="preview ${c.unread? 'unread':''}">${fmtPreview(c)}</p>
          </div>
          ${c.unread ? '<span class="dot"></span>' : ''}
        `;
        li.addEventListener('click', ()=>openChat(c.id));
        chatList.appendChild(li);
      });
  }

  function renderMessages(c){
    const box = $('messages');
    box.innerHTML = '';
    if (!c){ box.appendChild($('emptyState')); return; }
    let lastDay = '';
    c.messages.forEach(m=>{
      const d = new Date(m.t);
      const day = d.toLocaleDateString();
      if (day !== lastDay){
        const t = document.createElement('div');
        t.className = 'msg-time';
        t.textContent = day + ' · ' + d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        box.appendChild(t);
        lastDay = day;
      }
      const el = document.createElement('div');
      el.className = 'msg ' + (m.from==='me' ? 'me':'them');
      el.textContent = m.text;
      box.appendChild(el);
    });
    box.scrollTop = box.scrollHeight;
  }

  function openChat(id){
    activeId = id;
    const c = chats.find(x=>x.id===id);
    if (!c) return;
    c.unread = 0;
    save();
    $('convName').textContent = c.name;
    $('convStatus').textContent = c.status;
    $('convAvatar').src = c.avatar;
    $('composer').hidden = false;
    renderList($('searchInput').value);
    renderMessages(c);
    document.querySelector('.app-shell').classList.add('show-conv');
  }

  /* events */
  $('searchInput').addEventListener('input', e=>renderList(e.target.value));
  $('backBtn').addEventListener('click', ()=>{
    document.querySelector('.app-shell').classList.remove('show-conv');
  });
  $('logoutBtn').addEventListener('click', ()=>{
    if (confirm('Log out of Insta Proo?')){
      localStorage.removeItem(SESSION_KEY);
      window.location.href = 'index.html';
    }
  });
  $('newChatBtn').addEventListener('click', (e)=>{
    e.preventDefault();
    const name = prompt('Username to message:');
    if (!name) return;
    const clean = name.trim().toLowerCase().replace(/\s+/g,'.');
    const exists = chats.find(c=>c.name===clean);
    if (exists){ openChat(exists.id); return; }
    const nc = {id:'c'+Date.now(), name:clean, status:'Offline', unread:0, avatar:avatar(clean), messages:[]};
    chats.unshift(nc); save(); renderStories(); renderList(); openChat(nc.id);
  });

  $('composer').addEventListener('submit', (e)=>{
    e.preventDefault();
    const input = $('msgInput');
    const text = input.value.trim();
    if (!text || !activeId) return;
    const c = chats.find(x=>x.id===activeId);
    c.messages.push({from:'me', text, t:Date.now()});
    input.value = '';
    save();
    renderMessages(c);
    renderList($('searchInput').value);
    // tiny auto-reply for demo feel
    setTimeout(()=>{
      const replies = ['👍','Haha nice!','Got it','For real?','Tell me more 😄','Cool!','😂😂','Same here','On my way','Sounds good!'];
      c.messages.push({from:'them', text:replies[Math.floor(Math.random()*replies.length)], t:Date.now()});
      save(); if (activeId===c.id) renderMessages(c); renderList($('searchInput').value);
    }, 900 + Math.random()*1200);
  });

  /* initial render */
  renderStories();
  renderList();
  if (window.innerWidth > 820 && activeId) openChat(activeId);
  else renderMessages(null);
})();