function showUpgrade(){showOnly("upgradeScreen");upgradePicked=false;message("upgradeStatus","");const r=getRoom(),p=r?.players?.[selfId];if(!r||!p)return;syncLocalEconomy(p);$("upgradeTitle").textContent=`${r.round}라운드 종료 보상 선택`;$("upgradeDesc").textContent=`상점은 라운드에 포함되지 않습니다. 선택 후 ${r.pendingRound||r.round+1}라운드가 시작됩니다.`;buildUpgradeOptions(p,r)}
function rng(seed){let x=Math.sin(seed)*10000;return x-Math.floor(x)}
function sample(arr,n,seed){const a=[...arr],out=[];for(let i=0;i<n&&a.length;i++){const k=Math.floor(rng(seed+i*91)*a.length);out.push(a.splice(k,1)[0])}return out}
function dedicatedCard(p,seed){const e=elements[p.element]||elements.fire,rare=rng(seed)>0.72,idx=Math.floor(rng(seed+7)*e.cards.length),base=e.cards[idx];return{kind:"dedicated"+idx,title:rare?`희귀 전용 ${base.name}`:`전용 ${base.name}`,desc:rare?`${base.name} 피해와 효과가 증가합니다. 전용 강화는 원소 개성을 강화합니다.`:`${base.name} 피해와 효과가 증가합니다. 전용 강화는 원소 개성을 강화합니다.`,apply:q=>{q.power+=rare?0.12:0.08},cost:rare?12:10}}
function activateDevil(q){if(q.devil)return;q.devil=true;q.power=(q.power||1)+.12;q.drain=Math.max(q.drain||0,.1);q.maxHp=Math.min(220,(q.maxHp||100)+20);q.maxMana=Math.max(q.maxMana||100,110);q.hp=q.maxHp}
function activateOluo(q){if(!q.devil)activateDevil(q);if(q.oluo)return;q.oluo=true;q.power=(q.power||1)+.18;q.drain=Math.max(q.drain||0,.16);q.maxHp=Math.min(220,(q.maxHp||100)+35);q.maxMana=Math.max(q.maxMana||100,125);q.hp=q.maxHp}
function updateAscension(q){if((q.evolve||0)>=5)q.maxMana=Math.max(q.maxMana||100,110);if((q.crowns||0)>=7)q.maxMana=Math.max(q.maxMana||100,110)}
function dragonPartComplete(q){const parts=q.dragonParts||{};if(["fang","wing","tail","body","eye"].every(k=>parts[k])&&!q.dragonComplete){q.dragonComplete=true;q.maxHp=Math.max(q.maxHp||100,1200);q.hp=q.maxHp;q.power=Math.min(2.2,(q.power||1)+.25);q.maxMana=Math.max(q.maxMana||100,160)}}
function dragonPartCards(p){if(!hasElement(p,"dragon"))return[];const owned=p.dragonParts||{},part=(kind,title,desc,cost,apply)=>({kind:"dragon_"+kind,title,desc,cost,dragonPart:true,apply:q=>{q.dragonParts={...(q.dragonParts||{}),[kind]:true};apply(q);dragonPartComplete(q)}});return[
part("fang","드래곤 이빨","스킬 증폭이 크게 증가합니다. 지속 피해와 궁극기는 내부 상한이 적용됩니다.",22,q=>{q.power=Math.min(2.2,(q.power||1)+.8)}),
part("wing","드래곤 날개","제한 비행 기반 강화. 전투에서는 대쉬 거리가 강화됩니다.",20,q=>{q.dragonWing=true;q.maxMana=Math.max(q.maxMana||100,130)}),
part("tail","드래곤 꼬리","대쉬 종료 지점에 꼬리 충격파를 남깁니다.",18,q=>{q.dragonTail=true;q.power=(q.power||1)+.08}),
part("body","드래곤 몸","최대 체력 +35, 방어 효율과 저항이 강화됩니다.",21,q=>{q.dragonBody=true;q.maxHp=Math.min(260,(q.maxHp||100)+35);q.hp=q.maxHp;q.shieldBoost=(q.shieldBoost||0)+.15}),
part("eye","드래곤 눈","약점 감지로 첫 타격 피해가 증가합니다.",19,q=>{q.dragonEye=true;q.power=(q.power||1)+.1})
].filter(o=>!owned[String(o.kind).replace("dragon_","")])}
function specialUpgradeCards(p){const cards=[];if(hasElement(p,"hacker")&&upgradeCount(p,"hacker_discount")<1)cards.push({kind:"hacker_discount",title:"할인 코드",desc:"해커 상점 할인이 20%에서 25%로 강화됩니다.",cost:10,apply:q=>{q.maxMana=Math.max(q.maxMana||100,120)}});if(hasElement(p,"hacker")&&upgradeCount(p,"hacker_backdoor")<1)cards.push({kind:"hacker_backdoor",title:"백도어 강화",desc:"랜덤 동시구매 확률이 10%에서 13%로 증가합니다.",cost:12,apply:q=>{q.power=(q.power||1)+.04}});if(hasElement(p,"psychic")&&upgradeCount(p,"psy_mastery")<1)cards.push({kind:"psy_mastery",title:"무중력 숙련",desc:"염동력 범위와 밀쳐내기 성능이 증가합니다.",cost:11,apply:q=>{q.power=(q.power||1)+.08;q.maxMana=Math.max(q.maxMana||100,125)}});if(hasElement(p,"summoner")&&upgradeCount(p,"spirit_blessing")<1)cards.push({kind:"spirit_blessing",title:"대정령의 축복",desc:"정령술사 회복과 보호 효과가 증가합니다.",cost:11,apply:q=>{q.power=(q.power||1)+.06;q.maxMana=Math.max(q.maxMana||100,130)}});if((p.crowns||0)>=7&&!p.devil)cards.push({kind:"devil",title:"악마화 카드",desc:"왕관 7회 후 개방. 악마 카드, 흡혈, 저주 피해를 얻지만 마나 소모가 증가합니다.",cost:16,apply:activateDevil});if((p.evolve||0)>=5&&(p.crowns||0)>=7&&p.devil&&!p.oluo)cards.unshift({kind:"oluo",title:"올루오푸스 강림",desc:"최종 진화와 악마화를 합친 최종 상태. 전용 카드 4종으로 변경됩니다.",cost:0,apply:activateOluo});return cards}
function canOfferUpgrade(p,o){
  if(o.kind==="mana")return upgradeCount(p,o.kind)<5;
  if(o.kind==="power"||o.kind==="hp"||o.kind==="cool")return upgradeCount(p,o.kind)<5;
  if(o.kind==="coin")return (p.coinBonus||0)<3&&upgradeCount(p,o.kind)<3;
  if(o.kind==="evolve")return (p.evolve||0)<5;
  if(o.kind==="crown")return (p.crowns||0)<7;
  if(o.kind==="other")return (p.secondaryElements||[]).length<3;
  if(o.kind==="devil")return (p.crowns||0)>=7&&!p.devil;
  if(o.kind==="oluo")return (p.evolve||0)>=5&&(p.crowns||0)>=7&&p.devil&&!p.oluo;
  if(String(o.kind).startsWith("dragon_"))return hasElement(p,"dragon")&&!p.dragonParts?.[String(o.kind).replace("dragon_","")];
  if(String(o.kind).startsWith("dedicated"))return upgradeCount(p,o.kind)<2;
  return true;
}
function effectiveUpgradeCost(o,p){
  const base=o.cost||0;
  if(base<=0)return 0;
  const hasDiscount=upgradeCount(p,"hacker_discount")>0;
  const rate=hasElement(p,"hacker")?(hasDiscount ? .75 : .8):1;
  return Math.max(1,Math.ceil(base*rate));
}
function commonUpgradePool(){return[
{kind:"mana",title:"마나증가",desc:"최대 마나 50 증가. 최대 5중첩",cost:6,apply:q=>{q.maxMana=Math.min(350,(q.maxMana||100)+50);q.mana=clamp((q.mana||0)+50,0,q.maxMana)}},
{kind:"power",title:"능력증폭",desc:"카드 피해와 회복 6% 증가. 최대 5중첩",cost:7,apply:q=>{q.power+=.06}},
{kind:"hp",title:"체력증가",desc:"최대 체력 12 증가, 즉시 12 회복",cost:7,apply:q=>{q.maxHp=Math.min(200,(q.maxHp||100)+12);q.hp=clamp((q.hp||0)+12,0,q.maxHp)}},
{kind:"cool",title:"쿨타임감소",desc:"전체 카드 쿨타임 5% 감소",cost:8,apply:q=>{q.cdMul=Math.max(.75,(q.cdMul||1)*.95)}},
{kind:"coin",title:"추가 코인 증가",desc:"매 라운드 보상 코인 +1. 최대 3중첩",cost:6,apply:q=>{q.coinBonus=Math.min(3,(q.coinBonus||0)+1)}},
{kind:"evolve",title:"진화",desc:"5번 강화하면 최종 진화. 대쉬와 MP 회복도 강화",cost:12,apply:q=>{q.evolve=Math.min(5,(q.evolve||0)+1);if(q.evolve>=5){q.power+=.2;q.maxHp=Math.min(220,(q.maxHp||100)+20);q.hp=q.maxHp}updateAscension(q)}},
{kind:"crown",title:"왕관",desc:"7번 구매하면 악마화 조건 완료",cost:14,apply:q=>{q.crowns=Math.min(7,(q.crowns||0)+1);q.power+=.08;if(q.crowns>=2)q.drain=(q.drain||0)+.05;updateAscension(q)}},
{kind:"other",title:"랜덤 다른 능력카드",desc:"다른 원소를 보조 능력으로 흡수하고 주변 장식으로 표시",cost:9,apply:q=>{const pool=elementKeys.filter(x=>x!==q.element&&!(q.secondaryElements||[]).includes(x));const pick=pool[Math.floor(Math.random()*pool.length)]||elementKeys[0];q.secondaryElements=[...(q.secondaryElements||[]),pick].slice(-3);q.power+=.05;q.maxMana=Math.min(350,(q.maxMana||100)+8)}}
]}
function buildUpgradeOptions(p,r){const common=commonUpgradePool();
let pool=common.filter(o=>canOfferUpgrade(p,o));const seed=r.upgradeSeed+parseInt(selfId.replace(/\D/g,"").slice(0,5)||"7"),specials=specialUpgradeCards(p).filter(o=>canOfferUpgrade(p,o));let options=specials.slice(0,1);options.push(...sample(pool,3-options.length,seed));const dedicated=dedicatedCard(p,r.upgradeSeed+23);if(canOfferUpgrade(p,dedicated)&&rng(r.upgradeSeed+99)>.58){const replaceAt=options.findIndex(o=>!specials.includes(o));if(replaceAt>=0)options[replaceAt]=dedicated;else if(options.length<3)options.push(dedicated)}const dragonPool=dragonPartCards(p).filter(o=>canOfferUpgrade(p,o));if(r.round>=4&&dragonPool.length&&rng(r.upgradeSeed+501)<.05){const pick=dragonPool[Math.floor(rng(r.upgradeSeed+777)*dragonPool.length)],replaceAt=Math.max(0,options.findIndex(o=>!specials.includes(o)));options[replaceAt]=pick}if(!options.length)options=[{kind:"rest",title:"휴식",desc:"더 이상 선택 가능한 강화가 없습니다. 체력과 마나를 회복합니다.",cost:0,apply:q=>{q.hp=q.maxHp;q.mana=q.maxMana}}];const have=Math.max(p.coins||0,local.coins||0),box=$("upgradeOptions");box.innerHTML="";options.slice(0,3).forEach(o=>{const d=document.createElement("div");d.className="upgrade-card";const cost=effectiveUpgradeCost(o,p),discount=cost!==o.cost?` <span class="tag">해커 할인</span>`:"";d.innerHTML=`<h3>${o.title}</h3><p>${o.desc}</p><span class="tag">가격 ${cost}코인 · 보유 ${have}코인</span>${discount}`;d.onclick=()=>pickUpgrade(o,d);box.appendChild(d)})}
function syncLocalEconomy(p){if(p.gameId&&local.gameId&&p.gameId!==local.gameId){local.gameId=p.gameId;local.coins=Number(p.coins)||0;local.totalCoins=Number(p.totalCoins)||0;local.spent=Number(p.spent)||0;return local.coins}const coins=Math.max(Number(p.coins)||0,Number(local.coins)||0);p.coins=coins;local.coins=coins;p.totalCoins=Math.max(Number(p.totalCoins)||0,Number(local.totalCoins)||0);local.totalCoins=p.totalCoins;p.spent=Math.max(Number(p.spent)||0,Number(local.spent)||0);local.spent=p.spent;return coins}
function hackerBackdoor(p){if(!hasElement(p,"hacker"))return"";const chance=upgradeCount(p,"hacker_backdoor")>0?.13:.1;if(Math.random()>=chance)return"";const pool=commonUpgradePool().filter(o=>o.kind!=="oluo"&&canOfferUpgrade(p,o));if(!pool.length)return"";const pick=pool[Math.floor(Math.random()*pool.length)];pick.apply(p);markUpgrade(p,pick.kind);return` · 백도어 구매 성공: ${pick.title}`}
function pickUpgrade(o,node){if(upgradePicked)return;const r=getRoom(),p=r?.players?.[selfId];if(!p){message("upgradeStatus","플레이어 정보를 다시 불러오지 못했습니다.");return}const available=syncLocalEconomy(p),cost=effectiveUpgradeCost(o,p);if(available<cost){message("upgradeStatus",`코인이 부족합니다. 보유 ${available}코인 / 필요 ${cost}코인`);return}if(!canOfferUpgrade(p,o)&&o.kind!=="rest"){message("upgradeStatus","이미 최대 강화에 도달했습니다.");buildUpgradeOptions(p,r);return}o.apply(p);markUpgrade(p,o.kind);const backdoor=hackerBackdoor(p);p.coins=available-cost;p.spent=(p.spent||0)+cost;p.upgradeReady=true;local.coins=p.coins;local.spent=p.spent;local.maxHp=p.maxHp;local.maxMana=p.maxMana;local.power=p.power;local.move=p.move;local.moveBase=p.moveBase||1;local.cdMul=p.cdMul;local.evolve=p.evolve;local.crowns=p.crowns;local.coinBonus=p.coinBonus||0;local.drain=p.drain||0;local.devil=p.devil;local.oluo=p.oluo;local.dragonParts={...(p.dragonParts||{})};local.dragonComplete=!!p.dragonComplete;local.spirit=p.spirit||"fire";local.upgradeCounts={...(p.upgradeCounts||{})};local.secondaryElements=p.secondaryElements||[];r.players[selfId]=p;if(Object.values(r.players).every(x=>x.upgradeReady))r.nextStartAt=now()+3000;saveRoom(r);upgradePicked=true;document.querySelectorAll(".upgrade-card").forEach(x=>x.classList.remove("selected"));node.classList.add("selected");message("upgradeStatus","선택 완료"+backdoor+". 모두 선택하면 3초 뒤 전투가 시작됩니다.")}


