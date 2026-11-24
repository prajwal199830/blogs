import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, query, where, updateDoc, arrayUnion, setDoc } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIkvI7RPZr3bP172v8H_sQYCj5sr953nE",
  authDomain: "talethali.firebaseapp.com",
  projectId: "talethali",
  storageBucket: "talethali.firebasestorage.app",
  messagingSenderId: "26939382062",
  appId: "1:26939382062:web:c0eb9b216faad02813c2bf",
  measurementId: "G-CC8NT2PJSP"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Dark Mode
const darkToggle=document.getElementById('darkToggle');
if(localStorage.getItem('talethali-dark')==='true'){document.body.classList.add('dark');darkToggle.innerText='☀️';}
darkToggle.onclick=()=>{document.body.classList.toggle('dark');const d=document.body.classList.contains('dark');localStorage.setItem('talethali-dark',d);darkToggle.innerText=d?'☀️':'🌙';};

// Categories
const baseCategories=[
{name:"Love Story",emoji:"💖",dish:"Sweet Rasmalai",taste:"sweet",desc:"Love"},
{name:"Life Story",emoji:"🌿",dish:"Dal Chawal",taste:"comfort",desc:"Life"},
{name:"Office Story",emoji:"💼",dish:"Dal Tadka",taste:"comfort",desc:"Office"},
{name:"Horror Story",emoji:"👻",dish:"Spicy Mirchi",taste:"spicy",desc:"Horror"},
{name:"Breakup",emoji:"💔",dish:"Tangy Imli",taste:"tangy",desc:"Breakup"},
{name:"Friendship",emoji:"🤝",dish:"Lassi",taste:"sweet",desc:"Friends"},
{name:"College Life",emoji:"🎓",dish:"Samosa Chaat",taste:"tangy",desc:"College"},
{name:"Marriage Story",emoji:"💍",dish:"Biryani",taste:"comfort",desc:"Marriage"},
{name:"Ghost Stories",emoji:"👹",dish:"Extra Spicy",taste:"spicy",desc:"Ghost"},
{name:"Mystery",emoji:"🕵️",dish:"Pickle",taste:"tangy",desc:"Mystery"},
{name:"Secret Katori",emoji:"🤫",dish:"Midnight Chutney",taste:"spicy",desc:"Night 12-4 AM"},
{name:"Thali For Two",emoji:"💞",dish:"Special Thali",taste:"sweet",desc:"Co-written"}
];
const extra=["True Crime","Sci-Fi","Fantasy","Family Drama","Village Life","City Life","First Job","Startup Story","Travel Diary","Childhood","Teenage Life","Motherhood","Fatherhood","Sibling Stories","Long Distance","First Love","Second Chance","Heartbreak","Dating Fails","Wedding Stories","Divorce","In-Laws","Roommates","Boss Stories","Interview Stories","Work From Home","Corporate Life","Freelance Life","Business Failure","Success Story","Money Problems","Debt Story","School Memories","Exam Stress","Teacher Stories","Bullying","Revenge Story","Karma","Confession","Secret","Guilt","Regret","Forgiveness","Reunion","Lost and Found","Stranger Story","Kindness","Betrayal","Jealousy","Obsession","Stalker Story","Haunted House","Paranormal","Urban Legend","Creepypasta","Survival Story","Accident Story","Hospital Story","Mental Health","Anxiety","Depression","Healing","Motivation","Inspiration","Failure to Success","Sports Story","Gaming Story","Internet Story","Social Media","Catfish","Scam Story","Police Story","Courtroom","Prison Story","War Story","Historical Fiction","Mythology","Folklore","Fairy Tale","Adventure","Road Trip","Beach Story","Mountain Story","Forest Story","Pet Stories","Animal Rescue","Food Story","Cooking Fails","Party Story","Festival Story","Birthday","Childhood Crush","Office Romance","Secret Love","One-Sided Love","Toxic Relationship","Self Love","Spiritual Journey"];
extra.forEach(n=>{if(!baseCategories.find(c=>c.name===n)) baseCategories.push({name:n,emoji:"🍲",dish:n+" Special",taste:["sweet","spicy","tangy","comfort"][Math.floor(Math.random()*4)],desc:"Stories about "+n})});
const categories=baseCategories;
const dailyPrompts=["What's your most embarrassing office story?","Tell your 3 AM horror thought","Your most toxic relationship lesson?","A secret you never told family","Best breakup revenge story","Weirdest food you love","Ghost experience in hostel","One lie you told that changed life","Most awkward date story","A time you got caught lying","Your childhood superpower dream","Worst interview experience","A stranger who changed your life","Something you stole as a kid","Most expensive mistake","Family drama at wedding","When did you feel most alone?","A text you wish you never sent","Craziest thing done for love","School punishment story","First salary story","Weirdest dream you had","A promise you broke","Most jealous moment","When karma hit you hard","A kindness you still remember","Your biggest insecurity","Office crush story","A time you stood up for yourself","What would you tell your 16yo self?"];
function getDailyPrompt(){const day=Math.floor(Date.now()/86400000);return dailyPrompts[day % dailyPrompts.length];}
document.getElementById('dailyPrompt').innerText=getDailyPrompt();
document.getElementById('answerPromptBtn').onclick=()=>{if(!currentUser){authModal.classList.remove('hidden');return;} document.getElementById('addModal').classList.remove('hidden'); populateSelect(); document.getElementById('subjectInput').value=getDailyPrompt();};

let currentUser=null; let currentUserData=null;
const authModal=document.getElementById('authModal'); const loginBtn=document.getElementById('loginBtn'); const userArea=document.getElementById('userArea'); const inboxBtn=document.getElementById('inboxBtn');
const handles=["@pikkke","@bhootly","@katori_queen","@ghostly_ninja","@spicy_soul","@midnight_chai","@bhatakta_dil","@tangy_tales","@sweet_secret","@nashik_ninja","@pune_premi","@mumbai_masala"];
function randomHandle(){return handles[Math.floor(Math.random()*handles.length)]+"_"+Math.floor(Math.random()*900+100);}
function cleanUsername(u){let s=u.trim().toLowerCase(); if(!s.startsWith('@')) s='@'+s; return s;}
function usernameToEmail(username){let clean=username.replace('@','').toLowerCase().replace(/[^a-z0-9]/g,''); return clean + "@talethali.local";}

onAuthStateChanged(auth, async (user)=>{
  currentUser=user;
  if(user){
    loginBtn.classList.add('hidden'); userArea.classList.remove('hidden'); inboxBtn.classList.remove('hidden'); document.getElementById('streakSection').classList.remove('hidden'); document.getElementById('tasteMatch').classList.remove('hidden'); document.getElementById('thaliProgress').classList.remove('hidden'); document.getElementById('boostCityBtn').classList.remove('hidden');
    try{
      const uDoc=await getDoc(doc(db,'users',user.uid));
      if(uDoc.exists()){currentUserData=uDoc.data(); document.getElementById('userHandle').innerText=currentUserData.anonymousHandle; document.getElementById('streakDisplay').innerText="🔥"+(currentUserData.streakCount||0);}
      loadStreak(); loadProgress(); loadTasteMatches(); loadCityBattle(); loadInboxCount();
    }catch(e){}
  }else{
    loginBtn.classList.remove('hidden'); userArea.classList.add('hidden'); inboxBtn.classList.add('hidden'); document.getElementById('streakSection').classList.add('hidden'); document.getElementById('tasteMatch').classList.add('hidden'); document.getElementById('thaliProgress').classList.add('hidden'); document.getElementById('boostCityBtn').classList.add('hidden'); currentUserData=null;
  }
});

let isSignup=false;
document.getElementById('loginTab').onclick=()=>{isSignup=false;document.getElementById('loginTab').classList.add('active');document.getElementById('signupTab').classList.remove('active');document.getElementById('authSubmit').innerText='Login'; document.getElementById('citySelect').classList.add('hidden');};
document.getElementById('signupTab').onclick=()=>{isSignup=true;document.getElementById('loginTab').classList.remove('active');document.getElementById('signupTab').classList.add('active');document.getElementById('authSubmit').innerText='Sign Up'; document.getElementById('citySelect').classList.remove('hidden'); const h=randomHandle(); document.getElementById('handlePreview').innerText='Suggested: '+h; document.getElementById('authUsername').value=h;};
loginBtn.onclick=()=>{authModal.classList.remove('hidden'); document.getElementById('citySelect').classList.add('hidden');};
window.closeAuthModal=()=>authModal.classList.add('hidden');
document.getElementById('authSubmit').onclick=async()=>{
  const rawUser=document.getElementById('authUsername').value.trim(); const pass=document.getElementById('authPass').value; const city=document.getElementById('citySelect').value||"Nashik"; const status=document.getElementById('authStatus');
  if(!rawUser||!pass){status.innerText='Username and password required';return;}
  const username=cleanUsername(rawUser); const email=usernameToEmail(username);
  status.innerText='Processing...';
  try{
    if(isSignup){
      // check username unique
      const q=query(collection(db,'users'), where('anonymousHandle','==',username)); const snap=await getDocs(q); if(!snap.empty){status.innerText='Username taken, try '+username+'_'+Math.floor(Math.random()*99); return;}
      const cred=await createUserWithEmailAndPassword(auth,email,pass);
      await setDoc(doc(db,'users',cred.user.uid),{uid:cred.user.uid,username:username.replace('@',''),anonymousHandle:username,authEmail:email,city:city,allowMessageRequests:true,streakCount:0,lastPostDate:"",tasteStats:{sweet:0,spicy:0,tangy:0,comfort:0},badges:[],readTastes:[],createdAt:new Date().toISOString()});
      status.innerText='Account created as '+username+'!'; setTimeout(()=>closeAuthModal(),1000);
    }else{
      // login: find authEmail by username
      const q=query(collection(db,'users'), where('anonymousHandle','==',username)); const snap=await getDocs(q);
      let loginEmail=email;
      if(!snap.empty){ loginEmail=snap.docs[0].data().authEmail || email; }
      await signInWithEmailAndPassword(auth,loginEmail,pass);
      status.innerText='Logged in as '+username; setTimeout(()=>closeAuthModal(),800);
    }
  }catch(e){status.innerText='Error: '+e.message;}
};
document.getElementById('logoutBtn').onclick=()=>signOut(auth);
document.getElementById('profileBtn').onclick=()=>{document.getElementById('profileModal').classList.remove('hidden'); if(currentUserData){document.getElementById('profileHandle').innerText=currentUserData.anonymousHandle; document.getElementById('allowRequestsToggle').checked=currentUserData.allowMessageRequests;}};
window.closeProfileModal=()=>document.getElementById('profileModal').classList.add('hidden');
window.updateHandle=async()=>{const nh=cleanUsername(document.getElementById('newHandleInput').value.trim()); if(!nh){return;} const q=query(collection(db,'users'), where('anonymousHandle','==',nh)); const snap=await getDocs(q); if(!snap.empty){document.getElementById('profileStatus').innerText='Taken';return;} await updateDoc(doc(db,'users',currentUser.uid),{anonymousHandle:nh,username:nh.replace('@','')}); document.getElementById('profileStatus').innerText='Updated to '+nh; currentUserData.anonymousHandle=nh; document.getElementById('userHandle').innerText=nh;};
window.saveProfileSettings=async()=>{const allow=document.getElementById('allowRequestsToggle').checked; await updateDoc(doc(db,'users',currentUser.uid),{allowMessageRequests:allow}); document.getElementById('profileStatus').innerText='Saved';};

// City Battle
async function loadCityBattle(){
  try{
    const snap=await getDocs(collection(db,'blogs')); const cityMap={}; const today=new Date().toISOString().slice(0,10);
    snap.forEach(d=>{const b=d.data(); const date=b.createdAt?b.createdAt.slice(0,10):""; if(date===today){const city=b.city||"Nashik"; if(!cityMap[city]) cityMap[city]={chilly:0,count:0}; cityMap[city].chilly+=(b.chillyCount||0); cityMap[city].count+=1;}});
    const sorted=Object.entries(cityMap).sort((a,b)=>b[1].chilly-a[1].chilly);
    const list=document.getElementById('cityLeaderboard'); list.innerHTML=""; if(sorted.length===0){list.innerHTML="<p>No stories today yet. Be first!</p>";return;}
    sorted.forEach(([city,data],i)=>{const row=document.createElement('div'); row.className='city-row'+(i===0?' top':''); row.innerHTML=`<div><strong>${i+1}. ${city}</strong> <span class="small">${data.count} stories</span></div><div>🌶️ ${data.chilly}</div>`; list.appendChild(row);});
  }catch(e){}
}

// Streak
function loadStreak(){if(!currentUserData) return; const cal=document.getElementById('streakCalendar'); cal.innerHTML=""; for(let i=6;i>=0;i--){const d=new Date(); d.setDate(d.getDate()-i); const dot=document.createElement('div'); dot.className='streak-dot'; dot.innerText=d.getDate(); if(currentUserData.lastPostDate && d.toISOString().slice(0,10)<=currentUserData.lastPostDate) dot.classList.add('filled'); cal.appendChild(dot);} const st=currentUserData.streakCount||0; document.getElementById('streakText').innerText= st===0?"Post today to start streak!":`On ${st} day streak!`; const badgesDiv=document.getElementById('streakBadges'); let badge=""; if(st>=100) badge="🏆 Thali Legend"; else if(st>=30) badge="👑 Master Chef"; else if(st>=7) badge="🍳 Regular Cook"; else if(st>=3) badge="👨‍🍳 Starter Chef"; badgesDiv.innerText=badge?`Badge: ${badge}`:"";}
function checkSecret(){const hour=new Date().getHours(); if(hour>=0 && hour<4){document.getElementById('secretKatori').classList.remove('hidden');}} checkSecret();
function getChillyLevel(c){if(c>=100) return {label:"Legendary 👑",pct:100}; if(c>=50) return {label:"Hall of Fame 🏆",pct:80}; if(c>=25) return {label:"Fire Thali 🔥🔥",pct:60}; if(c>=10) return {label:"Too Spicy 🔥",pct:40}; if(c>=5) return {label:"Spicy 🌶️",pct:25}; return {label:"Tasty 😋",pct:10};}
async function loadTopSpicy(){try{const snap=await getDocs(collection(db,'blogs')); let arr=[]; const today=new Date().toISOString().slice(0,10); snap.forEach(d=>{let b=d.data(); b._id=d.id; arr.push(b);}); let todayArr=arr.filter(b=>b.createdAt && b.createdAt.slice(0,10)===today); if(todayArr.length===0) todayArr=arr; todayArr.sort((a,b)=>(b.chillyCount||0)-(a.chillyCount||0)); const top=todayArr.slice(0,10); const list=document.getElementById('topSpicyList'); list.innerHTML=""; top.forEach((b,i)=>{const div=document.createElement('div'); div.className='blog-item'; const level=getChillyLevel(b.chillyCount||0); div.innerHTML=`<div><strong>${i+1}. ${b.subject}</strong> <span class="small">${b.authorHandle} • ${level.label}</span></div><div>🌶️${b.chillyCount||0}</div>`; div.onclick=()=>openBlog(b); list.appendChild(div);});}catch(e){}}
loadTopSpicy();

let selectedCategory=null; let categoryCounts={};
const grid=document.getElementById('categoryGrid'); const search=document.getElementById('search'); const filterBtns=document.querySelectorAll('.filter-btn'); let activeTaste='all';
function renderCategories(){const term=search.value.toLowerCase(); grid.innerHTML=''; categories.filter(c=>{ if(c.name==="Secret Katori"){const h=new Date().getHours(); if(h>=0 && h<4) return c.name.toLowerCase().includes(term); else return false;} return c.name.toLowerCase().includes(term) && (activeTaste==='all'||c.taste===activeTaste || (activeTaste==='thaliForTwo' && c.name==='Thali For Two'));}).forEach(cat=>{const count=categoryCounts[cat.name]||0; const div=document.createElement('div'); div.className='katori-card'; div.innerHTML=`<div class="katori-emoji">${cat.emoji}</div><h3>${cat.name}</h3><div class="dish">${cat.dish}</div><div class="count">${count} stories</div>`; div.onclick=()=>openCategory(cat.name); grid.appendChild(div);});}
async function loadCounts(){try{const snap=await getDocs(collection(db,'blogs')); const counts={}; snap.forEach(d=>{const cat=d.data().category; counts[cat]=(counts[cat]||0)+1;}); categoryCounts=counts; renderCategories();}catch(e){renderCategories();}}
window.openCategory=async function(name){
  selectedCategory=name; const cat=categories.find(c=>c.name===name);
  document.getElementById('homeView').classList.add('hidden'); document.getElementById('categoryView').classList.remove('hidden'); document.getElementById('blogView').classList.add('hidden');
  document.getElementById('catName').innerText=cat.name; document.getElementById('catDish').innerText='Served as '+cat.dish; document.getElementById('catDesc').innerText=cat.desc; document.getElementById('catEmoji').innerText=cat.emoji;
  document.getElementById('blogList').innerHTML='<p>Loading...</p>';
  try{
    const q=query(collection(db,'blogs'), where('category','==',name)); const snap=await getDocs(q); const list=document.getElementById('blogList'); let arr=[]; snap.forEach(d=>{let b=d.data(); b._id=d.id; arr.push(b);}); arr.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    if(arr.length===0){list.innerHTML=`<p>No stories yet in ${name}. Be first!</p>`;return;} list.innerHTML=''; arr.forEach(b=>{const item=document.createElement('div'); item.className='blog-item'; const date=b.createdAt?new Date(b.createdAt).toLocaleDateString():''; const level=getChillyLevel(b.chillyCount||0); item.innerHTML=`<div><h4>${b.subject}</h4><div class="small">${b.authorHandle} • ${date} • 🌶️${b.chillyCount||0} ${level.label}</div></div><button>View</button>`; item.querySelector('button').onclick=()=>openBlog(b); list.appendChild(item);});
  }catch(e){document.getElementById('blogList').innerHTML='<p>Error</p>';}
}
let currentBlog=null;
window.openBlog=function(b){
  currentBlog=b; document.getElementById('categoryView').classList.add('hidden'); document.getElementById('blogView').classList.remove('hidden');
  const date=b.createdAt?new Date(b.createdAt).toLocaleDateString():''; const level=getChillyLevel(b.chillyCount||0);
  document.getElementById('blogArticle').innerHTML=`<h1>${b.subject}</h1><div class="small">${b.category} • ${b.authorHandle} • ${date} • ${b.city||""} • 🌶️${b.chillyCount||0} ${level.label}</div><p style="margin-top:16px;white-space:pre-wrap">${b.details||''}</p>`;
  document.getElementById('chillyCount').innerText=b.chillyCount||0; document.getElementById('chillyLevel').innerText=level.label; document.getElementById('heatFill').style.width=level.pct+'%';
  if(b.isChain || b.chainParentSlug){document.getElementById('chainNav').classList.remove('hidden'); document.getElementById('chainNav').innerHTML=`Chain: ${b.chainParentSlug||b.slug}`;}else{document.getElementById('chainNav').classList.add('hidden');}
  loadComments(b.slug||b._id);
  if(currentUserData){const stats=currentUserData.tasteStats||{}; const taste=b.taste||"comfort"; stats[taste]=(stats[taste]||0)+1; updateDoc(doc(db,'users',currentUser.uid),{tasteStats:stats,readTastes:arrayUnion(taste)}).catch(()=>{});}
}
window.showHome=function(){document.getElementById('homeView').classList.remove('hidden');document.getElementById('categoryView').classList.add('hidden');document.getElementById('blogView').classList.add('hidden');window.scrollTo(0,0);loadCityBattle();loadTopSpicy();}
window.backToCategory=function(){if(selectedCategory){openCategory(selectedCategory);}else{showHome();}}

const modal=document.getElementById('addModal');
document.getElementById('serveBtn').onclick=()=>{if(!currentUser){authModal.classList.remove('hidden');return;} modal.classList.remove('hidden'); populateSelect();};
document.getElementById('boostCityBtn').onclick=()=>{if(!currentUser){authModal.classList.remove('hidden');return;} modal.classList.remove('hidden'); populateSelect();};
window.closeModal=()=>modal.classList.add('hidden');
function populateSelect(){const sel=document.getElementById('categorySelect'); if(sel.options.length>0) return; categories.forEach(c=>{const opt=document.createElement('option'); opt.value=c.name; opt.textContent=c.name; sel.appendChild(opt);}); if(selectedCategory) sel.value=selectedCategory;}
document.getElementById('isChainCheck').onchange=(e)=>{document.getElementById('chainParentInput').classList.toggle('hidden',!e.target.checked);};
window.saveStory=async function(){
  if(!currentUser){authModal.classList.remove('hidden');return;}
  const category=document.getElementById('categorySelect').value; const subject=document.getElementById('subjectInput').value.trim(); const details=document.getElementById('detailsInput').value.trim(); const status=document.getElementById('saveStatus'); const btn=document.getElementById('saveBtn');
  if(!subject||!details){status.innerText='Required';return;}
  btn.disabled=true; status.innerText='Serving...'; const createdAt=new Date().toISOString(); const slug=subject.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Date.now();
  const catObj=categories.find(c=>c.name===category); const isChain=document.getElementById('isChainCheck').checked; const chainParent=document.getElementById('chainParentInput').value.trim();
  try{
    const today=new Date().toISOString().slice(0,10); let streak=currentUserData.streakCount||0; let last=currentUserData.lastPostDate||""; if(last!==today){ const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1); const yStr=yesterday.toISOString().slice(0,10); if(last===yStr) streak+=1; else streak=1; }
    await addDoc(collection(db,'blogs'),{category,subject,details,authorHandle:currentUserData.anonymousHandle,authorUid:currentUser.uid,createdAt,slug,chillyCount:0,chillyBy:[],commentCount:0,taste:catObj?catObj.taste:"comfort",city:currentUserData.city||"Nashik",isChain:!!isChain,chainParentSlug:chainParent||null,isDailyPrompt:subject===getDailyPrompt(),isThaliForTwo:category==="Thali For Two"});
    await updateDoc(doc(db,'users',currentUser.uid),{streakCount:streak,lastPostDate:today});
    currentUserData.streakCount=streak; currentUserData.lastPostDate=today; loadStreak(); status.innerText='Served! 🍽️'; setTimeout(()=>{closeModal(); document.getElementById('subjectInput').value=''; document.getElementById('detailsInput').value=''; status.innerText=''; btn.disabled=false; loadCounts(); loadCityBattle(); loadTopSpicy();},1000);
  }catch(e){status.innerText='Error: '+e.message; btn.disabled=false;}
}

document.getElementById('chillyBtn').onclick=async()=>{
  if(!currentUser){authModal.classList.remove('hidden');return;} if(!currentBlog) return;
  try{
    const q=query(collection(db,'blogs'), where('slug','==',currentBlog.slug)); const snap=await getDocs(q); if(snap.empty) return; const docRef=snap.docs[0].ref; const data=snap.docs[0].data(); let by=data.chillyBy||[]; let count=data.chillyCount||0;
    if(by.includes(currentUser.uid)){ by=by.filter(u=>u!==currentUser.uid); count=Math.max(0,count-1); } else { by.push(currentUser.uid); count+=1; }
    await updateDoc(docRef,{chillyBy:by,chillyCount:count}); currentBlog.chillyCount=count; document.getElementById('chillyCount').innerText=count; const level=getChillyLevel(count); document.getElementById('chillyLevel').innerText=level.label; document.getElementById('heatFill').style.width=level.pct+'%'; loadCityBattle(); loadTopSpicy();
  }catch(e){}
};
document.getElementById('shareBtn').onclick=async()=>{if(!currentBlog) return; const url=location.href.split('?')[0]+'?story='+currentBlog.slug; const text=currentBlog.subject+' - Read on TaleThali'; if(navigator.share){try{await navigator.share({title:currentBlog.subject,text:text,url:url});}catch(e){}} else { await navigator.clipboard.writeText(url); alert('Link copied: '+url);} };
async function loadComments(slug){const list=document.getElementById('commentsList'); list.innerHTML='Loading...'; try{const q=query(collection(db,'comments'), where('blogSlug','==',slug)); const snap=await getDocs(q); let arr=[]; snap.forEach(d=>arr.push(d.data())); arr.sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt)); list.innerHTML=''; if(arr.length===0) list.innerHTML='<p>No comments yet</p>'; arr.forEach(c=>{const div=document.createElement('div'); div.className='comment-item'; div.innerHTML=`<strong>${c.authorHandle}</strong>: ${c.text}`; list.appendChild(div);});}catch(e){list.innerHTML='Error';}}
window.addComment=async()=>{if(!currentUser){authModal.classList.remove('hidden');return;} const text=document.getElementById('commentText').value.trim(); if(!text||!currentBlog) return; try{await addDoc(collection(db,'comments'),{blogSlug:currentBlog.slug||currentBlog._id,text,authorHandle:currentUserData.anonymousHandle,authorUid:currentUser.uid,createdAt:new Date().toISOString()}); document.getElementById('commentText').value=''; loadComments(currentBlog.slug||currentBlog._id);}catch(e){}};

let msgToUid=null; let msgToHandle=null;
document.getElementById('messageAuthorBtn').onclick=async()=>{
  if(!currentUser){authModal.classList.remove('hidden');return;} if(!currentBlog) return; if(currentBlog.authorUid===currentUser.uid){alert('Cannot message yourself');return;}
  try{const authorDoc=await getDoc(doc(db,'users',currentBlog.authorUid)); if(authorDoc.exists() && authorDoc.data().allowMessageRequests===false){alert('User disabled requests');return;}}catch(e){}
  msgToUid=currentBlog.authorUid; msgToHandle=currentBlog.authorHandle; document.getElementById('msgToHandle').innerText=msgToHandle; document.getElementById('messageModal').classList.remove('hidden');
};
window.closeMessageModal=()=>document.getElementById('messageModal').classList.add('hidden');
window.sendMessageRequest=async()=>{
  const text=document.getElementById('messageText').value.trim(); if(!text) return;
  try{await addDoc(collection(db,'messageRequests'),{fromUid:currentUser.uid,fromHandle:currentUserData.anonymousHandle,toUid:msgToUid,toHandle:msgToHandle,blogSlug:currentBlog.slug,status:'pending',text:text,createdAt:new Date().toISOString()}); document.getElementById('messageStatus').innerText='Request sent!'; setTimeout(()=>closeMessageModal(),1000);}catch(e){document.getElementById('messageStatus').innerText='Error: '+e.message;}
};
document.getElementById('chainBtn').onclick=()=>{if(!currentUser){authModal.classList.remove('hidden');return;} modal.classList.remove('hidden'); populateSelect(); document.getElementById('isChainCheck').checked=true; document.getElementById('chainParentInput').classList.remove('hidden'); document.getElementById('chainParentInput').value=currentBlog.slug; document.getElementById('subjectInput').value='Continuation of '+currentBlog.subject;};
document.getElementById('inboxBtn').onclick=()=>{document.getElementById('inboxModal').classList.remove('hidden'); loadInbox();};
window.closeInbox=()=>document.getElementById('inboxModal').classList.add('hidden');
window.showInboxTab=(tab)=>{if(tab==='requests'){document.getElementById('reqTab').classList.add('active');document.getElementById('chatTab').classList.remove('active');document.getElementById('requestsList').classList.remove('hidden');document.getElementById('chatsList').classList.add('hidden');document.getElementById('chatMessages').classList.add('hidden');}else{document.getElementById('chatTab').classList.add('active');document.getElementById('reqTab').classList.remove('active');document.getElementById('requestsList').classList.add('hidden');document.getElementById('chatsList').classList.remove('hidden');document.getElementById('chatMessages').classList.add('hidden');loadChats();}};
let currentChatRequest=null; let currentChatWith=null;
async function loadInbox(){const list=document.getElementById('requestsList'); list.innerHTML='Loading...'; try{const q=query(collection(db,'messageRequests'), where('toUid','==',currentUser.uid), where('status','==','pending')); const snap=await getDocs(q); let arr=[]; snap.forEach(d=>{let data=d.data(); data._id=d.id; arr.push(data);}); list.innerHTML=''; if(arr.length===0) list.innerHTML='<p>No pending requests</p>'; arr.forEach(r=>{const div=document.createElement('div'); div.className='blog-item'; div.innerHTML=`<div><strong>${r.fromHandle}</strong><br><small>${r.text}</small></div><div><button onclick="acceptReq('${r._id}')">Accept</button> <button onclick="rejectReq('${r._id}')">Reject</button></div>`; list.appendChild(div);});}catch(e){list.innerHTML='Error';}}
async function loadChats(){const list=document.getElementById('chatsList'); list.innerHTML='Loading...'; try{const q1=query(collection(db,'messageRequests'), where('fromUid','==',currentUser.uid), where('status','==','accepted')); const q2=query(collection(db,'messageRequests'), where('toUid','==',currentUser.uid), where('status','==','accepted')); const s1=await getDocs(q1); const s2=await getDocs(q2); let arr=[]; s1.forEach(d=>{let data=d.data(); data._id=d.id; arr.push(data);}); s2.forEach(d=>{let data=d.data(); data._id=d.id; arr.push(data);}); list.innerHTML=''; if(arr.length===0) list.innerHTML='<p>No chats yet</p>'; arr.forEach(r=>{const other = r.fromUid===currentUser.uid ? r.toHandle : r.fromHandle; const div=document.createElement('div'); div.className='blog-item'; div.innerHTML=`<div><strong>${other}</strong><br><small>${r.blogSlug}</small></div><button>Chat</button>`; div.querySelector('button').onclick=()=>openChat(r); list.appendChild(div);});}catch(e){list.innerHTML='Error';}}
window.acceptReq=async(id)=>{await updateDoc(doc(db,'messageRequests',id),{status:'accepted'}); loadInbox(); loadInboxCount();};
window.rejectReq=async(id)=>{await updateDoc(doc(db,'messageRequests',id),{status:'rejected'}); loadInbox();};
function openChat(req){currentChatRequest=req; const otherUid= req.fromUid===currentUser.uid ? req.toUid : req.fromUid; currentChatWith=otherUid; document.getElementById('chatsList').classList.add('hidden'); document.getElementById('requestsList').classList.add('hidden'); document.getElementById('chatMessages').classList.remove('hidden'); document.getElementById('chatWith').innerText='Chat with '+ (req.fromUid===currentUser.uid ? req.toHandle : req.fromHandle); loadMessages();}
window.backToChats=()=>{document.getElementById('chatMessages').classList.add('hidden'); document.getElementById('chatsList').classList.remove('hidden');};
async function loadMessages(){if(!currentChatRequest) return; const list=document.getElementById('messagesList'); list.innerHTML='Loading...'; try{const q=query(collection(db,'messages'), where('requestId','==',currentChatRequest._id)); const snap=await getDocs(q); let arr=[]; snap.forEach(d=>arr.push(d.data())); arr.sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt)); list.innerHTML=''; arr.forEach(m=>{const div=document.createElement('div'); div.className='comment-item'; div.innerHTML=`<strong>${m.fromHandle}:</strong> ${m.text}`; list.appendChild(div);}); if(arr.length>=6){document.getElementById('thaliForTwoBanner').classList.remove('hidden');} else {document.getElementById('thaliForTwoBanner').classList.add('hidden');}}catch(e){list.innerHTML='Error';}}
window.sendChatMessage=async()=>{const text=document.getElementById('chatInput').value.trim(); if(!text||!currentChatRequest) return; try{await addDoc(collection(db,'messages'),{fromUid:currentUser.uid,fromHandle:currentUserData.anonymousHandle,toUid:currentChatWith,text,createdAt:new Date().toISOString(),requestId:currentChatRequest._id}); document.getElementById('chatInput').value=''; loadMessages();}catch(e){}};
window.createThaliForTwo=()=>{document.getElementById('inboxModal').classList.add('hidden'); modal.classList.remove('hidden'); populateSelect(); document.getElementById('categorySelect').value='Thali For Two';};
async function loadInboxCount(){try{const q=query(collection(db,'messageRequests'), where('toUid','==',currentUser.uid), where('status','==','pending')); const snap=await getDocs(q); document.getElementById('inboxCount').innerText=snap.size>0?snap.size:"";}catch(e){}}
async function loadTasteMatches(){if(!currentUserData) return; try{const snap=await getDocs(collection(db,'users')); let users=[]; snap.forEach(d=>{if(d.id!==currentUser.uid) users.push(d.data());}); const myTaste=currentUserData.tasteStats||{}; const myTop=Object.entries(myTaste).sort((a,b)=>b[1]-a[1])[0]; users.forEach(u=>{const uTop=Object.entries(u.tasteStats||{}).sort((a,b)=>b[1]-a[1])[0]; let match=0; if(uTop && myTop && uTop[0]===myTop[0]) match=80; else match=Math.floor(Math.random()*40+20); u.match=match;}); users.sort((a,b)=>b.match-a.match); const top3=users.slice(0,3); const list=document.getElementById('tasteMatchList'); list.innerHTML=""; top3.forEach(u=>{const div=document.createElement('div'); div.className='blog-item'; div.innerHTML=`<div><strong>${u.anonymousHandle}</strong> • ${u.city||""} • ${u.match}% match</div><button>Connect</button>`; div.querySelector('button').onclick=async()=>{await addDoc(collection(db,'messageRequests'),{fromUid:currentUser.uid,fromHandle:currentUserData.anonymousHandle,toUid:u.uid,toHandle:u.anonymousHandle,blogSlug:'taste-match',status:'pending',text:'Same taste!',createdAt:new Date().toISOString()}); alert('Request sent');}; list.appendChild(div);});}catch(e){}}
function loadProgress(){if(!currentUserData) return; const read=currentUserData.readTastes||[]; const unique=[...new Set(read)]; const pct=(unique.length/4)*100; document.getElementById('progressFill').style.width=pct+'%'; document.getElementById('progressText').innerText=`${unique.length}/4 tastes: ${unique.join(', ')||'none'}`; if(unique.length>=4 && !(currentUserData.badges||[]).includes('Full Thali')){updateDoc(doc(db,'users',currentUser.uid),{badges:arrayUnion('Full Thali')}); document.getElementById('badgeDisplay').innerText='🏆 Full Thali Unlocked!';} else {document.getElementById('badgeDisplay').innerText=(currentUserData.badges||[]).join(' • ');}}
search.addEventListener('input',renderCategories);
filterBtns.forEach(btn=>{btn.onclick=()=>{filterBtns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTaste=btn.dataset.taste;renderCategories();}});
renderCategories(); loadCounts(); loadCityBattle();
