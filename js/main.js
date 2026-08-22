(function(){
"use strict";
var RM=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

var store={
  get:function(k,f){
    try{var v=localStorage.getItem("x9_"+k);return v===null?f:v}catch(e){return f}
  },
  set:function(k,v){
    try{localStorage.setItem("x9_"+k,String(v))}catch(e){}
  }
};

var toastWrap=document.getElementById("toasts");
function toast(msg,ms){
  if(!toastWrap)return;
  var t=document.createElement("div");
  t.className="toast";
  t.textContent=msg;
  toastWrap.appendChild(t);
  requestAnimationFrame(function(){t.classList.add("show")});
  setTimeout(function(){
    t.classList.remove("show");
    setTimeout(function(){
      if(t.parentNode)t.parentNode.removeChild(t);
    },350);
  },ms||3400);
}

var audio={ctx:null,on:false};
function ensureCtx(){
  if(!audio.ctx){
    try{audio.ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}
  }
}
function blip(freq,dur,type,vol){
  if(!audio.on)return;
  ensureCtx();
  if(!audio.ctx)return;
  try{
    var t0=audio.ctx.currentTime;
    var o=audio.ctx.createOscillator();
    var g=audio.ctx.createGain();
    o.type=type||"sine";
    o.frequency.setValueAtTime(freq,t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.55),t0+dur);
    g.gain.setValueAtTime(vol||.06,t0);
    g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(g);
    g.connect(audio.ctx.destination);
    o.start(t0);
    o.stop(t0+dur+.03);
  }catch(e){}
}
function pop(){blip(330,.09,"sine",.07)}
function plink(){blip(720,.07,"triangle",.05)}
function tada(){blip(520,.12,"triangle",.07);setTimeout(function(){blip(780,.16,"triangle",.07)},110)}

function initSound(){
  var btn=document.getElementById("soundBtn");
  if(!btn)return;
  audio.on=store.get("sound","0")==="1";
  function paint(){
    btn.setAttribute("aria-pressed",String(audio.on));
    btn.classList.toggle("on",audio.on);
  }
  paint();
  btn.addEventListener("click",function(){
    audio.on=!audio.on;
    store.set("sound",audio.on?"1":"0");
    paint();
    if(audio.on){ensureCtx();tada();}
    toast(audio.on?"Interface sounds on":"Quiet mode — sounds off");
  });
}

var CONF=["#2440F0","#FF5C28","#CFC5FF","#3E7C4F","#E85B8A","#14120E"];
function confetti(n){
  if(RM)return;
  var total=n||90;
  for(var i=0;i<total;i++){
    (function(idx){
      var p=document.createElement("i");
      p.className="confetto";
      p.style.left=(42+Math.random()*24)+"vw";
      p.style.background=CONF[idx%CONF.length];
      var s=6+Math.random()*9;
      p.style.width=s+"px";
      p.style.height=(s*1.35)+"px";
      p.style.borderRadius=Math.random()<.4?"50%":"2px";
      document.body.appendChild(p);
      var dx=(Math.random()*2-1)*280;
      var dy=window.innerHeight*(.8+Math.random()*.4);
      var rot=(Math.random()*2-1)*760;
      try{
        var anim=p.animate([
          {transform:"translate(0,-30px) rotate(0deg)",opacity:1},
          {transform:"translate("+dx+"px,"+dy+"px) rotate("+rot+"deg)",opacity:.85}
        ],{duration:1600+Math.random()*1500,easing:"cubic-bezier(.18,.6,.4,1)",delay:Math.random()*220});
        anim.onfinish=function(){if(p.parentNode)p.parentNode.removeChild(p)};
      }catch(e){
        if(p.parentNode)p.parentNode.removeChild(p);
      }
    })(i);
  }
}

function initClickSounds(){
  document.addEventListener("click",function(e){
    if(!audio.on)return;
    var t=e.target.closest("a,button");
    if(!t)return;
    if(t.closest(".toasts"))return;
    if(t.id==="soundBtn"||t.id==="themeBtn"||t.id==="copyEmail"||t.id==="sendBtn"||t.id==="talkFab")return;
    var freq=620;
    if(t.classList.contains("mm-link"))freq=540;
    else if(t.closest(".head-nav")||t.closest(".foot-links")||t.closest(".foot-col")||t.closest(".mobile-menu"))freq=540;
    else if(t.classList.contains("btn"))freq=690;
    else if(t.classList.contains("socials")||t.closest(".socials"))freq=600;
    blip(freq,.05,"triangle",.045);
  });
}

function initTheme(){
  var h=new Date().getHours();
  var mode=store.get("theme","")||((h>=19||h<7)?"night":"day");
  document.documentElement.setAttribute("data-theme",mode);
  var btn=document.getElementById("themeBtn");
  if(!btn)return;
  btn.addEventListener("click",function(){
    var cur=document.documentElement.getAttribute("data-theme")||"day";
    var next=cur==="night"?"day":"night";
    document.documentElement.setAttribute("data-theme",next);
    store.set("theme",next);
    plink();
  });
}

var visitTotal=1;
function initHello(){
  var h=new Date().getHours();
  var g=h<5?"Burning the midnight oil?":h<12?"Good morning — coffee's on.":h<18?"Good afternoon.":"Good evening.";
  var el=document.getElementById("greeting");
  if(el)el.textContent=g;
  visitTotal=parseInt(store.get("visits","0"),10)+1;
  store.set("visits",visitTotal);
  var v=document.getElementById("visitChip");
  if(v)v.textContent=visitTotal>1?("Visit #"+visitTotal+" — welcome back"):"First visit — make yourself at home";
  var sv=document.getElementById("statVisits");
  if(sv)sv.textContent="Visit #"+visitTotal;
}

function initClock(){
  var el=document.getElementById("clock");
  if(!el)return;
  function tick(){
    var d=new Date();
    var hh=String(d.getHours()).padStart(2,"0");
    var mm=String(d.getMinutes()).padStart(2,"0");
    el.innerHTML=hh+'<span class="colon">:</span>'+mm;
  }
  tick();
  setInterval(tick,10000);
}

function party(){
  confetti(140);
  tada();
  toast("Konami accepted — the studio salutes you 🏅",4500);
}
function initKonami(){
  var seq=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  var pos=0;
  window.addEventListener("keydown",function(e){
    if(e.target&&(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT"))return;
    var k=e.key.length===1?e.key.toLowerCase():e.key;
    if(k===seq[pos]){
      pos++;
      if(pos>=seq.length){pos=0;party();}
    }else{
      pos=(k===seq[0])?1:0;
    }
  });
}

function initTitleSwap(){
  var base=document.title;
  document.addEventListener("visibilitychange",function(){
    document.title=document.hidden?"Still here — the studio waits ✳":base;
  });
}

function initIdle(){
  if(RM)return;
  var t=null,shown=false;
  function arm(){
    clearTimeout(t);
    if(!shown)t=setTimeout(function(){
      shown=true;
      toast("Still browsing? Take your time — the kettle stays warm ☕");
    },60000);
  }
  ["pointermove","keydown","scroll","pointerdown"].forEach(function(ev){
    window.addEventListener(ev,arm,{passive:true});
  });
  arm();
}

function initScreensStat(){
  var el=document.getElementById("statScreens");
  var maxS=0,t=null;
  function upd(){
    if(!el)return;
    var ih=Math.max(window.innerHeight,1);
    var screens=(maxS+ih)/ih;
    el.textContent=screens.toFixed(1)+" screens deep";
  }
  window.addEventListener("scroll",function(){
    maxS=Math.max(maxS,window.scrollY);
    clearTimeout(t);
    t=setTimeout(upd,300);
  },{passive:true});
  upd();
}

function initCopyEmail(){
  var btn=document.getElementById("copyEmail");
  if(!btn)return;
  var EMAIL="hello@x9creatives.co";
  var label=btn.querySelector(".copy-label");
  var orig=label.textContent;
  btn.addEventListener("click",function(){
    function ok(){
      label.textContent="Copied! Talk soon ✓";
      btn.classList.add("did");
      pop();
      toast('"'+EMAIL+'" is on your clipboard');
      setTimeout(function(){
        label.textContent=orig;
        btn.classList.remove("did");
      },2200);
    }
    function fallback(){
      var ta=document.createElement("textarea");
      ta.value=EMAIL;
      ta.style.position="fixed";
      ta.style.opacity="0";
      document.body.appendChild(ta);
      ta.select();
      try{
        document.execCommand("copy");
        ok();
      }catch(e){
        toast("Couldn't copy — it's "+EMAIL);
      }
      document.body.removeChild(ta);
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(EMAIL).then(ok,fallback);
    }else{
      fallback();
    }
  });
}

function initOfficeHours(){
  var dot=document.getElementById("officeDot");
  var status=document.getElementById("officeStatus");
  if(!dot||!status)return;
  var now=new Date();
  var day=now.getDay();
  var h=now.getHours();
  var open=day>=1&&day<=5&&h>=10&&h<19;
  if(open){
    status.textContent="Studio open right now — replies are quick.";
    dot.classList.remove("away");
  }else{
    status.textContent="Studio closed — we'll reply first thing tomorrow.";
    dot.classList.add("away");
  }
}

function initReveals(){
  var els=document.querySelectorAll(".reveal");
  if(RM||!("IntersectionObserver" in window)){
    els.forEach(function(el){el.classList.add("in-view")});
    return;
  }
  els.forEach(function(el){
    var d=parseInt(el.getAttribute("data-d")||"0",10);
    if(d>0)el.style.transitionDelay=(d*80)+"ms";
  });
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        en.target.classList.add("in-view");
        io.unobserve(en.target);
      }
    });
  },{threshold:.15,rootMargin:"0px 0px -30px 0px"});
  els.forEach(function(el){io.observe(el)});
}

function initCounters(){
  var counters=document.querySelectorAll("[data-count]");
  function render(el,val,suffix,pad){
    var txt=String(val);
    if(pad&&val<10)txt="0"+txt;
    el.textContent=txt+(suffix||"");
  }
  if(RM||!("IntersectionObserver" in window)){
    counters.forEach(function(el){
      render(el,parseInt(el.getAttribute("data-count"),10),el.getAttribute("data-suffix"),el.getAttribute("data-pad")==="true");
    });
    return;
  }
  var cio=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting)return;
      cio.unobserve(en.target);
      var el=en.target;
      var target=parseInt(el.getAttribute("data-count"),10);
      var suffix=el.getAttribute("data-suffix")||"";
      var pad=el.getAttribute("data-pad")==="true";
      var start=performance.now();
      var dur=1500;
      function run(now){
        var p=Math.min((now-start)/dur,1);
        var eased=1-Math.pow(1-p,3);
        render(el,Math.round(target*eased),suffix,pad);
        if(p<1)requestAnimationFrame(run);
      }
      requestAnimationFrame(run);
    });
  },{threshold:.5});
  counters.forEach(function(c){cio.observe(c)});
}

function initPillars(){
  document.querySelectorAll(".pillar-row").forEach(function(row){
    var head=row.querySelector(".pillar-head");
    if(!head)return;
    head.setAttribute("aria-expanded","false");
    head.addEventListener("click",function(){
      var open=row.classList.contains("open");
      document.querySelectorAll(".pillar-row.open").forEach(function(other){
        other.classList.remove("open");
        var oh=other.querySelector(".pillar-head");
        if(oh)oh.setAttribute("aria-expanded","false");
      });
      if(!open){
        row.classList.add("open");
        head.setAttribute("aria-expanded","true");
      }
      plink();
    });
  });
}

function initFaq(){
  document.querySelectorAll(".faq").forEach(function(faq){
    var q=faq.querySelector(".faq-q");
    if(!q)return;
    q.setAttribute("aria-expanded","false");
    q.addEventListener("click",function(){
      var open=faq.classList.contains("open");
      document.querySelectorAll(".faq.open").forEach(function(other){
        other.classList.remove("open");
        var oq=other.querySelector(".faq-q");
        if(oq)oq.setAttribute("aria-expanded","false");
      });
      if(!open){
        faq.classList.add("open");
        q.setAttribute("aria-expanded","true");
        plink();
      }else{
        pop();
      }
    });
  });
}

var INBOX="trillionnewton@gmail.com";

function initForm(){
  var form=document.getElementById("contactForm");
  if(!form)return;
  var name=document.getElementById("cName");
  var email=document.getElementById("cEmail");
  var budget=document.getElementById("cBudget");
  var msg=document.getElementById("cMsg");
  var send=document.getElementById("sendBtn");
  var done=document.getElementById("formDone");

  function check(input,badMsg,test){
    var wrap=input.closest(".field");
    var m=wrap.querySelector(".msg");
    var v=input.value.trim();
    var ok=v.length>0&&test(v);
    wrap.classList.toggle("bad",!ok&&v.length>0);
    wrap.classList.toggle("ok",ok);
    m.textContent=v.length===0?"":(ok?"Looks good.":badMsg);
    return ok;
  }
  function nameOk(v){return v.length>=2}
  function emailOk(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
  function msgOk(v){return v.length>=10}

  name.addEventListener("blur",function(){check(name,"A name helps — even a nickname works.",nameOk)});
  email.addEventListener("blur",function(){check(email,"That email needs an @ and a dot to reach us.",emailOk)});
  msg.addEventListener("blur",function(){check(msg,"Tell us a little more — one more sentence?",msgOk)});

  function showDone(first){
    var dn=document.getElementById("doneName");
    if(dn)dn.textContent=first;
    form.style.display="none";
    done.classList.add("show");
    confetti(60);
    tada();
    toast("Brief sent — landing in our inbox right now.");
  }

  form.addEventListener("submit",function(e){
    e.preventDefault();
    var n=name.value.trim();
    var em=email.value.trim();
    var m=msg.value.trim();
    var okN=nameOk(n);
    var okE=emailOk(em);
    var okM=msgOk(m);
    check(name,"A name helps — even a nickname works.",nameOk);
    check(email,"That email needs an @ and a dot to reach us.",emailOk);
    check(msg,"Tell us a little more — one more sentence?",msgOk);
    if(!okN){name.focus();toast("Almost there — we just need your name.");return;}
    if(!okE){email.focus();toast("One valid email away…");return;}
    if(!okM){msg.focus();toast("Give us one more sentence!");return;}

    send.disabled=true;
    send.textContent="Sending…";

    fetch("https://formsubmit.co/ajax/"+INBOX,{
      method:"POST",
      headers:{"Content-Type":"application/json",Accept:"application/json"},
      body:JSON.stringify({
        _subject:"New brief from "+n+" — X9 Creatives site",
        _template:"table",
        _captcha:"false",
        Name:n,
        Email:em,
        Need:(budget&&budget.value)?budget.value:"Not sure yet",
        Message:m
      })
    })
    .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})
    .then(function(res){
      var good=res.ok&&res.j&&(res.j.success==="true"||res.j.success===true);
      if(good){showDone(n.split(/\s+/)[0]);}
      else{throw new Error("send failed");}
    })
    .catch(function(){
      send.disabled=false;
      send.textContent="Send it over →";
      toast("Couldn't send just now — email us directly at hello@x9creatives.co",5200);
    });
  });
}

function initTalk(){
  var fab=document.getElementById("talkFab");
  if(!fab)return;
  var wrap=document.getElementById("talkWrap");
  var dot=document.getElementById("fabDot");
  var label=fab.querySelector(".fab-label");
  var now=new Date();
  var open=(now.getDay()>=1&&now.getDay()<=5&&now.getHours()>=10&&now.getHours()<19);
  if(dot)dot.classList.add(open?"on":"away");

  var PHRASES=["Talk to us","Free first call","We reply within a day","Bring the problem"];
  var pi=0,timer=null,popOpen=false;
  function cycle(){
    pi=(pi+1)%PHRASES.length;
    if(!label)return;
    label.classList.add("swap-out");
    setTimeout(function(){
      label.textContent=PHRASES[pi];
      label.classList.remove("swap-out");
    },220);
  }
  function start(){clearInterval(timer);timer=setInterval(cycle,3600);}
  function stop(){clearInterval(timer);}
  start();

  fab.addEventListener("mouseenter",stop);
  fab.addEventListener("mouseleave",function(){if(!popOpen)start();});
  fab.addEventListener("click",function(e){
    e.preventDefault();
    popOpen=wrap.classList.toggle("open");
    fab.setAttribute("aria-expanded",String(popOpen));
    if(popOpen){stop();label.textContent="Talk to us";plink();}
    else{start();}
  });
  document.addEventListener("click",function(e){
    if(popOpen&&wrap&&!wrap.contains(e.target)){
      popOpen=false;
      wrap.classList.remove("open");
      fab.setAttribute("aria-expanded","false");
      start();
    }
  });
}

function initMenu(){
  var b=document.getElementById("burgerBtn");
  if(!b)return;
  var m=document.getElementById("mobileMenu");
  function setOpen(o){
    document.body.classList.toggle("menu-open",o);
    b.setAttribute("aria-expanded",String(o));
    b.setAttribute("aria-label",o?"Close menu":"Open menu");
    if(m)m.setAttribute("aria-hidden",String(!o));
    o?plink():pop();
  }
  b.addEventListener("click",function(){
    setOpen(!document.body.classList.contains("menu-open"));
  });
  if(m){
    m.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click",function(){setOpen(false)});
    });
  }
  window.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&document.body.classList.contains("menu-open"))setOpen(false);
  });
}

initTheme();
initSound();
initHello();
initClock();
initKonami();
initTitleSwap();
initIdle();
initScreensStat();
initCopyEmail();
initOfficeHours();
initReveals();
initCounters();
initPillars();
initFaq();
initForm();
initTalk();
initMenu();
initClickSounds();

setTimeout(function(){
  if(visitTotal>3)toast("Third time this week? We must be doing something right.");
},1500);

})();
