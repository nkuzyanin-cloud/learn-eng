'use strict';
(()=>{
const D=window.HOUSE_CONTENT,C=window.COURSE,chapters=new Map(D.chapters.map(c=>[c.id,c])),items=new Map(D.shop.map(i=>[i.id,i])),slots=['seat','table','light','plant','rug','wall','accent','finish'];
const defaults={seat:[28,77],table:[69,79],light:[72,69],plant:[17,72],rug:[48,89],wall:[53,37],accent:[66,63],finish:[50,50]};
const fresh=()=>({version:1,progress:{},purchases:[],equipped:{},positions:{},last:'c01',replay:null});
const blank=c=>({seen:false,puzzle:c.type==='pairs'?c.setup.left.map(()=>null):['order','audio-order'].includes(c.type)?c.setup.tiles.map(()=>null):c.type==='dials'?c.setup.start.slice():c.type==='switches'?c.setup.labels.map(()=>false):c.type==='route'?[c.setup.start]:[0,0],solved:false,drawer:false,taken:false,door:false,finished:false,hint:0,attempts:0,at:null});
const spent=g=>g.purchases.reduce((s,id)=>s+(items.get(id)?.cost||0),0),budget=(g,xp)=>Math.max(0,xp-spent(g));
const plural=n=>n%100>=11&&n%100<=14?'уроков':n%10===1?'урок':n%10>=2&&n%10<=4?'урока':'уроков';
function gate(g,c,completed){if(!c)return 'Неизвестная глава';if(g.progress[c.id]?.finished)return '';const prev=c.bonus?c.after:(Number(c.id.slice(1))>1?'c'+String(Number(c.id.slice(1))-1).padStart(2,'0'):null);if(prev&&!g.progress[prev]?.finished)return c.bonus?'Сначала заверши главу «'+chapters.get(prev).title+'»':'Сначала заверши предыдущую главу';const known=Object.keys(completed).filter(id=>C.lessons.some(l=>l.id===id));if(known.length<c.lesson)return `Пройди ещё ${c.lesson-known.length} ${plural(c.lesson-known.length)} английского`;const topics=new Set(known.map(id=>C.lessons.find(l=>l.id===id)?.guided?.topic));const missing=c.prerequisites.filter(n=>!topics.has(C.lessons[n-1].guided.topic));return missing.length?'Нужна тема: '+[...new Set(missing.map(n=>C.lessons[n-1].guided.topic))].join('; '):'';}
const current=(g,c)=>g.replay?.chapter===c.id?g.replay.progress:g.progress[c.id]||blank(c);
const adjacent=(a,b)=>Math.abs(a%3-b%3)+Math.abs(Math.floor(a/3)-Math.floor(b/3))===1;
const solved=(c,p)=>c.type==='water'?p[0]===c.setup.target:JSON.stringify(p)===JSON.stringify(c.answer);
function validPuzzle(c,raw){const b=blank(c).puzzle;if(!Array.isArray(raw)||raw.length>20)return b;let p;
if(['order','audio-order'].includes(c.type)){p=b.map((_,i)=>c.setup.tiles.includes(raw[i])?raw[i]:null);const used=new Set();p=p.map(v=>v&&!used.has(v)?(used.add(v),v):null);}
else if(c.type==='pairs'){p=b.map((_,i)=>Number.isInteger(raw[i])&&raw[i]>=0&&raw[i]<c.setup.right.length?raw[i]:null);const used=new Set();p=p.map(v=>v!==null&&!used.has(v)?(used.add(v),v):null);}
else if(c.type==='dials')p=b.map((_,i)=>Number.isInteger(raw[i])&&raw[i]>=0&&raw[i]<=9?raw[i]:0);
else if(c.type==='switches')p=b.map((_,i)=>raw[i]===true);
else if(c.type==='water')p=b.map((_,i)=>Number.isInteger(raw[i])&&raw[i]>=0&&raw[i]<=c.setup.capacities[i]?raw[i]:0);
else{p=[c.setup.start];for(const v of raw.slice(1)){if(!Number.isInteger(v)||v<0||v>8||c.setup.blocked?.includes(v)||p.includes(v)||!adjacent(p.at(-1),v))break;p.push(v);}}return p;}
const bound=(slot,p)=>[Math.min(88,Math.max(12,Number(p?.[0])||50)),Math.min(slot==='wall'?52:91,Math.max(slot==='wall'?24:['light','accent'].includes(slot)?35:60,Number(p?.[1])||70))];
function cleanProgress(c,x){const p=blank(c);if(!x||typeof x!=='object')return p;p.seen=x.seen===true;p.puzzle=validPuzzle(c,x.puzzle);p.solved=p.seen&&x.solved===true&&solved(c,p.puzzle);p.drawer=p.solved&&x.drawer===true;p.taken=p.drawer&&x.taken===true;p.door=p.taken&&x.door===true;p.finished=p.door&&x.finished===true;p.at=p.finished&&typeof x.at==='string'&&Number.isFinite(Date.parse(x.at))?x.at:null;if(p.finished&&!p.at)p.finished=false;p.hint=Math.min(3,Math.max(0,Math.floor(Number(x.hint)||0)));p.attempts=Math.min(9999,Math.max(0,Math.floor(Number(x.attempts)||0)));return p;}
function valid(x,xp,completed){const g=fresh();if(!x||x.version!==1)return g;for(const c of D.chapters){if(x.progress?.[c.id]&&!gate(g,c,completed))g.progress[c.id]=cleanProgress(c,x.progress[c.id]);}for(const id of Array.isArray(x.purchases)?x.purchases:[]){const i=items.get(id);if(i&&!g.purchases.includes(id)&&spent(g)+i.cost<=xp)g.purchases.push(id);}for(const slot of slots){const id=x.equipped?.[slot];if(g.purchases.includes(id)&&items.get(id)?.slot===slot)g.equipped[slot]=id;if(Array.isArray(x.positions?.[slot]))g.positions[slot]=bound(slot,x.positions[slot]);}if(chapters.has(x.last))g.last=x.last;if(x.replay&&chapters.has(x.replay.chapter)&&g.progress[x.replay.chapter]?.finished)g.replay={chapter:x.replay.chapter,progress:cleanProgress(chapters.get(x.replay.chapter),x.replay.progress)};return g;}
function apply(source,a,xp,completed){const g=structuredClone(source),fail=error=>({ok:false,error}),ok=()=>({ok:true,game:g});
if(a.type==='buy'||a.type==='equip'){const i=items.get(a.id);if(!i)return fail('Предмет не найден');if(a.type==='buy'){if(g.purchases.includes(i.id))return fail('Предмет уже куплен');if(budget(g,xp)<i.cost)return fail('Не хватает XP');g.purchases.push(i.id);}else if(!g.purchases.includes(i.id))return fail('Сначала купи предмет');g.equipped[i.slot]=i.id;return ok();}
if(a.type==='remove'){if(!slots.includes(a.slot))return fail('Неизвестная категория');delete g.equipped[a.slot];return ok();}
if(a.type==='move'){if(!g.equipped[a.slot])return fail('Предмет не установлен');g.positions[a.slot]=bound(a.slot,a.position);return ok();}
const c=chapters.get(a.chapter);if(!c)return fail('Глава не найдена');if(a.type==='replay'){if(!g.progress[c.id]?.finished)return fail('Сначала заверши главу');g.replay={chapter:c.id,progress:blank(c)};return ok();}const reason=gate(g,c,completed);if(reason)return fail(reason);let p;if(g.replay?.chapter===c.id)p=g.replay.progress;else p=g.progress[c.id]||(g.progress[c.id]=blank(c));if(p.finished)return fail('Глава уже завершена');
if(a.type==='inspect')p.seen=true;
else if(a.type==='hint'){if(!p.seen)return fail('Сначала прочитай записку');p.hint=Math.min(3,p.hint+1);}
else if(a.type==='puzzle'){if(!p.seen||p.solved)return fail('Механизм сейчас недоступен');p.puzzle=validPuzzle(c,a.value);}
else if(a.type==='check'){if(!p.seen)return fail('Сначала прочитай записку');if(!solved(c,p.puzzle)){p.attempts++;return {ok:false,error:'Механизм пока не сработал. Сверь условия записки.',game:g};}p.solved=true;}
else if(a.type==='drawer'){if(!p.solved)return fail('Сначала настрой механизм');if(p.drawer)return fail('Ящик уже открыт');p.drawer=true;}
else if(a.type==='take'){if(!p.drawer||p.taken)return fail('Сначала открой ящик или проверь карман');p.taken=true;}
else if(a.type==='door'){if(!p.taken||p.door)return fail('Нужен ключ из ящика');p.door=true;}
else if(a.type==='finish'){if(!p.door)return fail('Сначала открой дверь');p.finished=true;p.at=new Date().toISOString();}
else return fail('Неизвестное действие');g.last=c.id;return ok();}
window.HouseEngine={data:D,chapters,items,slots,defaults,fresh,blank,spent,budget,gate,current,adjacent,solved,validPuzzle,bound,valid,apply};
})();
