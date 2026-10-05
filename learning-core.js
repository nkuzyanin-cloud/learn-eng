/* The reference follows the exact topic taught by each episode, never its title or number. */
window.LearningCore=(()=>{
 const articles=window.RULE_REFERENCE.articles, rules=new Map(articles.map(a=>[a.id,a]));
 const unlocked=(a,completed)=>a.lessons.some(id=>!!completed[id]);
 const bank=articles.flatMap(a=>[
  {id:a.id+'-fix',rule:a.id,type:'fix',prompt:'Исправь ошибку. Сохрани смысл и остальные слова.',display:a.error.bad,answer:a.error.good,why:a.error.why,accept:a.error.accept||[]},
  {id:a.id+'-rewrite',rule:a.id,type:'rewrite',...a.change,why:a.details[0],accept:a.change.accept||[]},
  ...a.examples.map(([en,ru],i)=>({id:a.id+'-listen'+i,rule:a.id,type:'listen',prompt:'Послушай и выбери смысл реплики.',audio:en,answer:i,options:a.examples.map(e=>e[1]),why:en+' — '+ru}))
 ]), tasks=new Map(bank.map(t=>[t.id,t]));
 function available(completed,mode='mix',topic=null){return bank.filter(t=>unlocked(rules.get(t.rule),completed)&&(!topic||t.rule===topic)&&(mode==='mix'||t.type===mode));}
 function choose(completed,history={},mode='mix',topic=null){
  const pool=available(completed,mode,topic).map(t=>({t,count:history[t.id]?.count||0,rand:Math.random()})).sort((a,b)=>a.count-b.count||a.rand-b.rand);
  if(mode!=='mix')return pool.slice(0,5).map(x=>x.t.id);
  const result=[];for(const type of ['listen','fix','rewrite']){const x=pool.find(x=>x.t.type===type&&!result.includes(x.t.id));if(x)result.push(x.t.id);}
  for(const x of pool)if(result.length<5&&!result.includes(x.t.id))result.push(x.t.id);
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;
 }
 function validHistory(raw){const result={};for(const [id,v] of Object.entries(raw||{}))if(tasks.has(id)&&v&&Number.isInteger(v.count)&&v.count>=1&&v.count<=100000&&typeof v.at==='string'&&Number.isFinite(Date.parse(v.at)))result[id]={count:v.count,at:v.at};return result;}
 function validActive(a,completed){
  if(!a||!Array.isArray(a.ids)||!a.ids.length||a.ids.length>5||new Set(a.ids).size!==a.ids.length||!['mix','listen','fix','rewrite'].includes(a.mode)||!Number.isInteger(a.index)||a.index<0||a.index>=a.ids.length)return null;
  if(a.topic!==null&&!rules.has(a.topic))return null;
  if(a.ids.some(id=>!tasks.has(id)||!unlocked(rules.get(tasks.get(id).rule),completed)||(a.mode!=='mix'&&tasks.get(id).type!==a.mode)||(a.topic&&tasks.get(id).rule!==a.topic)))return null;
  const t=tasks.get(a.ids[a.index]);
  return {ids:a.ids.slice(),index:a.index,mode:a.mode,topic:a.topic,draft:typeof a.draft==='string'?a.draft.slice(0,1200):'',choice:Number.isInteger(a.choice)&&a.choice>=0&&a.choice<(t.options?.length||0)?a.choice:null,passed:a.passed===true,errors:Number.isInteger(a.errors)?Math.max(0,Math.min(999,a.errors)):0,textMode:a.textMode===true,started:typeof a.started==='string'&&Number.isFinite(Date.parse(a.started))?a.started:new Date().toISOString()};
 }
 function validRecap(a,completed){if(!a||!Array.isArray(a.ids)||!a.ids.length||a.ids.length>5||new Set(a.ids).size!==a.ids.length||a.ids.some(id=>!tasks.has(id)||!unlocked(rules.get(tasks.get(id).rule),completed))||!Number.isInteger(a.errors)||a.errors<0||a.errors>999||typeof a.at!=='string'||!Number.isFinite(Date.parse(a.at)))return null;return {ids:a.ids.slice(),errors:a.errors,at:a.at};}
 function grade(t,a,matches){if(t.id==='r07-fix'&&/[’']/.test(a.draft||''))return false;return t.options?a.choice===t.answer:matches(a.draft,t);}
 return {articles,rules,bank,tasks,unlocked,available,choose,validHistory,validActive,validRecap,grade};
})();
