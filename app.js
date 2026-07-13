const $ = id => document.getElementById(id);
const fmt = n => (Math.round((Number(n)||0)*10)/10).toFixed(1);
const toSeconds = (m,s) => (Number(m)||0)*60 + (Number(s)||0);
let scores = {cardio:0, body:0, strength:0, core:0};
let fails = {cardio:true, body:true, strength:true, core:true};
function scoreEvent(event, rawValue){
  if(!rawValue || rawValue <= 0) return {points:0, fail:true, message:'Enter a value'};
  const sex=$('sex').value, age=$('ageGroup').value, meta=EVENT_META[event], rows=SCORE_TABLES[event][sex][age];
  const row = meta.direction === 'lower' ? rows.find(r => rawValue <= r.value) : rows.find(r => rawValue >= r.value);
  if(!row){const floor=rows[rows.length-1]; return {points:0, fail:true, message:`Below scoring floor. Minimum listed value: ${displayValue(event,floor.value)} = ${fmt(floor.points)} pts`};}
  const floorPoints=meta.maxPoints===50?35:2.5;
  const maxed=meta.direction==='lower'?rawValue<=rows[0].value:rawValue>=rows[0].value;
  return {points:row.points, fail:row.points<floorPoints, message:`${meta.label}: ${fmt(row.points)} pts. ${maxed?'Maximum listed score met.':'Matched threshold: '+displayValue(event,row.value)+'.'}`};
}
function scoreBody(){
  const h=Number($('heightIn').value)||0, w=Number($('waistIn').value)||0;
  if(!h||!w) return {points:0, fail:true, message:'Enter height and waist'};
  const ratio=Math.round((w/h)*100)/100, row=WHTR_TABLE.find(r=>ratio<=r.max);
  return {points:row.points, fail:row.points===0, message:`WHtR ${ratio.toFixed(2)} (${row.label}) = ${fmt(row.points)} pts`};
}
function updateVisibility(){
  const cardio=$('cardioEvent').value;
  $('runBox').classList.toggle('hidden',cardio!=='run2mile');
  $('hamrBox').classList.toggle('hidden',cardio!=='hamr');
  const core=$('coreEvent').value;
  $('coreRepBox').classList.toggle('hidden',core==='plank');
  $('plankBox').classList.toggle('hidden',core!=='plank');
}
function calculate(){
  const cardioEvent=$('cardioEvent').value;
  const cardioValue=cardioEvent==='run2mile'?toSeconds($('runMin').value,$('runSec').value):Number($('hamrShuttles').value)||0;
  const cardio=scoreEvent(cardioEvent,cardioValue); scores.cardio=cardio.points; fails.cardio=cardio.fail; $('cardioScore').textContent=fmt(cardio.points); $('cardioHint').textContent=cardio.message;
  const body=scoreBody(); scores.body=body.points; fails.body=body.fail; $('bodyScore').textContent=fmt(body.points); $('bodyHint').textContent=body.message;
  const strength=scoreEvent($('strengthEvent').value,Number($('strengthReps').value)||0); scores.strength=strength.points; fails.strength=strength.fail; $('strengthScore').textContent=fmt(strength.points); $('strengthHint').textContent=strength.message;
  const coreEvent=$('coreEvent').value;
  const coreValue=coreEvent==='plank'?toSeconds($('plankMin').value,$('plankSec').value):Number($('coreReps').value)||0;
  const core=scoreEvent(coreEvent,coreValue); scores.core=core.points; fails.core=core.fail; $('coreScore').textContent=fmt(core.points); $('coreHint').textContent=core.message;
  updateSummary();
}
function updateSummary(){
  const total=scores.cardio+scores.body+scores.strength+scores.core;
  $('totalScore').textContent=fmt(total); $('bdCardio').textContent=fmt(scores.cardio); $('bdBody').textContent=fmt(scores.body); $('bdStrength').textContent=fmt(scores.strength); $('bdCore').textContent=fmt(scores.core); $('scoreBar').style.width=Math.min(100,total)+'%';
  const pending=Object.values(fails).some(Boolean), rate=$('rating');
  rate.className='rating '+(total>=90&&!pending?'excellent':total>=75&&!pending?'pass':total>0?'fail':'wait');
  rate.textContent=total>=90&&!pending?'Excellent':total>=75&&!pending?'Satisfactory':total>0?'Fail / Incomplete':'Waiting for values';
  $('note').textContent=pending?'One or more components are missing or below the listed scoring floor.':'Projection complete. Verify record testing with official guidance.';
  $('copyBox').value=`USAF PFRA projected score: ${fmt(total)}/100\nCardio: ${fmt(scores.cardio)}/50${fails.cardio?' (pending/floor)':''}\nBody: ${fmt(scores.body)}/20${fails.body?' (pending/floor)':''}\nStrength: ${fmt(scores.strength)}/15${fails.strength?' (pending/floor)':''}\nCore: ${fmt(scores.core)}/15${fails.core?' (pending/floor)':''}\nRating: ${rate.textContent}`;
}
function init(){
  $('ageGroup').innerHTML=AGE_GROUPS.map(g=>`<option value="${g.id}">${g.label}</option>`).join('');
  updateVisibility();
  document.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',()=>{updateVisibility();calculate();}));
  $('resetBtn').onclick=()=>{document.getElementById('calculator').reset();updateVisibility();calculate();};
  $('copyBtn').onclick=async()=>{try{await navigator.clipboard.writeText($('copyBox').value);$('copyBtn').textContent='Copied';setTimeout(()=>$('copyBtn').textContent='Copy Summary',1200)}catch{$('copyBox').select();document.execCommand('copy')}};
  calculate();
}
document.addEventListener('DOMContentLoaded',init);