/* XP uses stable historical task keys. Reflection records remain archival only. */
'use strict';
(()=>{
 const C=window.COURSE;
 const taskIndices=(l,guided=true)=>l.tasks.map((t,i)=>i).filter(i=>l.tasks[i].type!=='reflection'&&(guided?i>=(l.legacyCount||0):i<(l.legacyCount||l.tasks.length)));
 const awardKey=(l,i)=>l.tasks[i].awardKey||`${l.id}:${i}`;
 const thresholds=[0];
 const moduleXP=C.modules.map(m=>m.lessons.reduce((sum,id)=>{const l=C.lessons.find(l=>l.id===id),seen=new Set();return sum+taskIndices(l).reduce((xp,i)=>{const key=awardKey(l,i);if(seen.has(key))return xp;seen.add(key);return xp+l.tasks[i].xp;},0);},0));
 for(const xp of moduleXP)thresholds.push(thresholds.at(-1)+xp);
 const ranks=[1,4,7,10,13,16];
 function progress(xp){xp=Math.max(0,Number.isFinite(xp)?xp:0);let level=1;while(level<thresholds.length&&xp>=thresholds[level])level++;const min=thresholds[level-1],max=thresholds[level]??min,done=level===thresholds.length,span=max-min,earned=Math.max(0,xp-min);return {level,min,max,earned,span,remaining:done?0:max-xp,percent:done?100:Math.min(100,earned/span*100),rank:ranks.filter(n=>n<=level).at(-1),done};}
 // A completed guided lesson proves all its checked tasks passed. An active cursor
 // proves only tasks before that cursor; the current one needs a checked response.
 // Restore only missing listen awards affected by the former text-mode exclusion.
 function restoreListeningXP(state,matches){let recovered=0;for(const l of C.lessons){const completed=state.completed[l.id],a=state.active?.lesson===l.id?state.active:null;if(!completed&&!a)continue;const guided=completed?completed.guidedDone===true:a.guided===true;const indices=taskIndices(l,guided);let added=0;for(const i of indices){const t=l.tasks[i];if(t.type!=='listen'||!(t.xp>0))continue;const key=awardKey(l,i);if(state.awards[key]>0)continue;const prior=a&&a.phase==='practice'&&i<a.index;const current=a&&a.phase==='practice'&&i===a.index&&a.passed&&a.textMode&&matches(a.draft,t);if(!completed&&!prior&&!current)continue;state.awards[key]=t.xp;added+=t.xp;}if(completed)completed.earned+=added;else if(a)a.earned+=added;recovered+=added;}return recovered;}
 window.LevelCore=Object.freeze({taskIndices,awardKey,progress,restoreListeningXP,thresholds:Object.freeze(thresholds),moduleXP:Object.freeze(moduleXP),ranks:Object.freeze(ranks)});
})();
