import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";

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
try { getAnalytics(app); } catch(e) {}

const categories = [
{name:"Love Story",emoji:"💖",dish:"Sweet Rasmalai",taste:"sweet",desc:"Tales of first love, romance and heartbeats."},
{name:"Life Story",emoji:"🌿",dish:"Comfort Dal Chawal",taste:"comfort",desc:"Real life experiences and lessons."},
{name:"Office Story",emoji:"💼",dish:"Dal Tadka",taste:"comfort",desc:"9 to 5 dramas and corporate tales."},
{name:"Horror Story",emoji:"👻",dish:"Spicy Mirchi",taste:"spicy",desc:"Ghosts, chills and sleepless nights."},
{name:"Breakup",emoji:"💔",dish:"Tangy Imli",taste:"tangy",desc:"When love ends and healing begins."},
{name:"Friendship",emoji:"🤝",dish:"Sweet Lassi",taste:"sweet",desc:"Friends who became family."},
{name:"College Life",emoji:"🎓",dish:"Samosa Chaat",taste:"tangy",desc:"Bunking, exams and hostel life."},
{name:"Marriage Story",emoji:"💍",dish:"Biryani",taste:"comfort",desc:"Shaadi, love and adjustments."},
{name:"Ghost Stories",emoji:"👹",dish:"Extra Spicy",taste:"spicy",desc:"Paranormal and unexplained."},
{name:"Mystery",emoji:"🕵️",dish:"Mystery Pickle",taste:"tangy",desc:"Twists you never saw coming."},
{name:"True Crime",emoji:"🔪",dish:"Red Chilli",taste:"spicy",desc:"Crime, justice and darkness."},
{name:"Sci-Fi",emoji:"🚀",dish:"Space Papad",taste:"comfort",desc:"Future, tech and beyond."},
{name:"Fantasy",emoji:"🧚",dish:"Magic Halwa",taste:"sweet",desc:"Magic, dragons and dreams."},
{name:"Family Drama",emoji:"👨‍👩‍👧‍👦",dish:"Mix Veg",taste:"comfort",desc:"Family, fights and love."},
{name:"Village Life",emoji:"🌾",dish:"Makki Roti",taste:"comfort",desc:"Simple roots, deep stories."},
{name:"City Life",emoji:"🏙️",dish:"Fast Food",taste:"tangy",desc:"Metro life and struggles."},
{name:"First Job",emoji:"👔",dish:"First Roti",taste:"comfort",desc:"First salary, first boss."},
{name:"Startup Story",emoji:"💡",dish:"Startup Tadka",taste:"tangy",desc:"Dreams, failure and hustle."},
{name:"Travel Diary",emoji:"✈️",dish:"Travel Thali",taste:"comfort",desc:"Journeys and destinations."},
{name:"Childhood",emoji:"🧸",dish:"Childhood Ladoo",taste:"sweet",desc:"Memories of innocence."}
];

const extra = ["Teenage Life","Motherhood","Fatherhood","Sibling Stories","Long Distance","First Love","Second Chance","Heartbreak","Dating Fails","Wedding Stories","Divorce","In-Laws","Roommates","Boss Stories","Interview Stories","Work From Home","Corporate Life","Freelance Life","Business Failure","Success Story","Money Problems","Debt Story","School Memories","Exam Stress","Teacher Stories","Bullying","Revenge Story","Karma","Confession","Secret","Guilt","Regret","Forgiveness","Reunion","Lost and Found","Stranger Story","Kindness","Betrayal","Jealousy","Obsession","Stalker Story","Haunted House","Paranormal","Urban Legend","Creepypasta","Survival Story","Accident Story","Hospital Story","Mental Health","Anxiety","Depression","Healing","Motivation","Inspiration","Failure to Success","Sports Story","Gaming Story","Internet Story","Social Media","Catfish","Scam Story","Police Story","Courtroom","Prison Story","War Story","Historical Fiction","Mythology","Folklore","Fairy Tale","Adventure","Road Trip","Beach Story","Mountain Story","Forest Story","Pet Stories","Animal Rescue","Food Story","Cooking Fails","Party Story","Festival Story","Birthday","Childhood Crush","Office Romance","Secret Love","One-Sided Love","Toxic Relationship","Self Love","Spiritual Journey"];
extra.forEach(n=>{ if(!categories.find(c=>c.name===n)) categories.push({name:n,emoji:"🍲",dish:n+" Special",taste:["sweet","spicy","tangy","comfort"][Math.floor(Math.random()*4)],desc:"Stories about "+n})});

let selectedCategory = null;
let categoryCounts = {};
const grid = document.getElementById('categoryGrid');
const search = document.getElementById('search');
const filterBtns = document.querySelectorAll('.filter-btn');
let activeTaste = 'all';

function renderCategories(){
  const term = search.value.toLowerCase();
  grid.innerHTML = '';
  categories.filter(c=>{ const matchSearch=c.name.toLowerCase().includes(term); const matchTaste=activeTaste==='all'||c.taste===activeTaste; return matchSearch&&matchTaste; }).forEach(cat=>{
    const count = categoryCounts[cat.name]||0;
    const div=document.createElement('div'); div.className='katori-card';
    div.innerHTML=`<div class="katori-emoji">${cat.emoji}</div><h3>${cat.name}</h3><div class="dish">${cat.dish}</div><div class="count">${count} stories served</div>`;
    div.onclick=()=>openCategory(cat.name);
    grid.appendChild(div);
  });
}

async function loadCounts(){
  try{
    const snap=await getDocs(collection(db,'blogs'));
    const counts={}; snap.forEach(d=>{ const cat=d.data().category; counts[cat]=(counts[cat]||0)+1; });
    categoryCounts=counts; renderCategories();
  }catch(e){ console.log('counts error',e); renderCategories(); }
}

window.openCategory = async function(name){
  selectedCategory=name;
  const cat=categories.find(c=>c.name===name);
  document.getElementById('homeView').classList.add('hidden');
  document.getElementById('categoryView').classList.remove('hidden');
  document.getElementById('blogView').classList.add('hidden');
  document.getElementById('catName').innerText=cat.name;
  document.getElementById('catDish').innerText='Served as '+cat.dish;
  document.getElementById('catDesc').innerText=cat.desc;
  document.getElementById('catEmoji').innerText=cat.emoji;
  document.getElementById('blogList').innerHTML='<p>Loading dishes...</p>';
  try{
    const q=query(collection(db,'blogs'), where('category','==',name), orderBy('createdAt','desc'));
    const snap=await getDocs(q);
    const list=document.getElementById('blogList');
    if(snap.empty){ list.innerHTML=`<p>No stories served yet in ${name}. Be the first!</p>`; return; }
    list.innerHTML='';
    snap.forEach(docSnap=>{
      const b=docSnap.data();
      const item=document.createElement('div'); item.className='blog-item';
      const date=b.createdAt?new Date(b.createdAt).toLocaleDateString():'';
      item.innerHTML=`<div><h4>${b.subject}</h4><div class="meta">${b.author||'Anonymous'} • ${date}</div></div><button>View Details →</button>`;
      item.querySelector('button').onclick=()=>openBlog(b);
      list.appendChild(item);
    });
  }catch(e){
    try{
      const q2=query(collection(db,'blogs'), where('category','==',name));
      const snap2=await getDocs(q2);
      const list=document.getElementById('blogList');
      let arr=[]; snap2.forEach(d=>arr.push(d.data()));
      arr.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
      if(arr.length===0){ list.innerHTML=`<p>No stories served yet in ${name}.</p>`; return; }
      list.innerHTML='';
      arr.forEach(b=>{
        const item=document.createElement('div'); item.className='blog-item';
        const date=b.createdAt?new Date(b.createdAt).toLocaleDateString():'';
        item.innerHTML=`<div><h4>${b.subject}</h4><div class="meta">${b.author||'Anonymous'} • ${date}</div></div><button>View Details →</button>`;
        item.querySelector('button').onclick=()=>openBlog(b);
        list.appendChild(item);
      });
    }catch(e2){ document.getElementById('blogList').innerHTML='<p>Error loading stories. Check Firestore rules.</p>'; }
  }
}

window.openBlog = function(b){
  document.getElementById('categoryView').classList.add('hidden');
  document.getElementById('blogView').classList.remove('hidden');
  document.getElementById('blogArticle').innerHTML=`<h1>${b.subject}</h1><div class="meta">${b.category} • ${b.author||'Anonymous'} • ${b.createdAt?new Date(b.createdAt).toLocaleDateString():''}</div><p>${(b.details||'').replace(/\n/g,'<br>')}</p>`;
}
window.showHome = function(){
  document.getElementById('homeView').classList.remove('hidden');
  document.getElementById('categoryView').classList.add('hidden');
  document.getElementById('blogView').classList.add('hidden');
  window.scrollTo(0,0);
}
window.backToCategory = function(){
  document.getElementById('blogView').classList.add('hidden');
  document.getElementById('categoryView').classList.remove('hidden');
}
const modal=document.getElementById('addModal');
document.getElementById('serveBtn').onclick=()=>{ modal.classList.remove('hidden'); populateSelect(); }
window.closeModal = ()=> modal.classList.add('hidden');
function populateSelect(){
  const sel=document.getElementById('categorySelect');
  if(sel.options.length>0) return;
  categories.forEach(c=>{ const opt=document.createElement('option'); opt.value=c.name; opt.textContent=c.name; sel.appendChild(opt); });
  if(selectedCategory) sel.value=selectedCategory;
}
window.saveStory = async function(){
  const author=document.getElementById('authorName').value.trim()||'Anonymous';
  const category=document.getElementById('categorySelect').value;
  const subject=document.getElementById('subjectInput').value.trim();
  const details=document.getElementById('detailsInput').value.trim();
  const status=document.getElementById('saveStatus');
  const btn=document.getElementById('saveBtn');
  if(!subject||!details){ status.innerText='Subject and details required'; return; }
  btn.disabled=true; status.innerText='Serving...';
  const createdAt=new Date().toISOString();
  const slug=subject.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Date.now();
  try{
    await addDoc(collection(db,'blogs'),{category,subject,details,author,createdAt,slug});
    status.innerText='Story served! 🍽️';
    setTimeout(()=>{ closeModal(); document.getElementById('subjectInput').value=''; document.getElementById('detailsInput').value=''; status.innerText=''; btn.disabled=false; if(selectedCategory===category) openCategory(category); loadCounts(); },1000);
  }catch(e){ status.innerText='Error: '+e.message; btn.disabled=false; }
}
search.addEventListener('input',renderCategories);
filterBtns.forEach(btn=>{ btn.onclick=()=>{ filterBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); activeTaste=btn.dataset.taste; renderCategories(); } });
renderCategories();
loadCounts();
