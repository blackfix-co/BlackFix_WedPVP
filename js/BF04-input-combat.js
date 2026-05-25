// StellaCard split module: BF04-input-combat.js
function setSelectedCard(i){selectedCard=(i+4)%4;renderCards()}
function addEvents(){
  addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
  addEventListener("keydown",e=>{
    if(e.target?.id==="chatInput"){if(e.code==="Escape"){e.preventDefault();closeChat()}return}
    if(e.code==="Escape"&&!$("hud").classList.contains("hidden")){e.preventDefault();isPauseOpen()?closePauseMenu():openPauseMenu();return}
    if(isPauseOpen())return;
    if(e.code==="Enter"&&!$("hud").classList.contains("hidden")){e.preventDefault();openChat();return}
    if((e.code==="AltLeft"||e.code==="AltRight")&&!$("hud").classList.contains("hidden")&&local.alive&&!e.repeat){e.preventDefault();triggerAltParry();return}
    keys[e.code]=true;
    if(handleSpectatorKey(e))return;
    if(e.code==="KeyQ"&&!$("hud").classList.contains("hidden")){e.preventDefault();castDragonQ()}
    if(/^Digit[1-4]$/.test(e.code)&&local.alive)setSelectedCard(parseInt(e.code.at(-1))-1)
  });
  addEventListener("keyup",e=>{if(e.target?.id==="chatInput")return;keys[e.code]=false});
  addEventListener("wheel",e=>{if($("hud").classList.contains("hidden")||isPauseOpen()||!local.alive||e.target?.closest?.(".chat"))return;e.preventDefault();setSelectedCard(selectedCard+(e.deltaY>0?1:-1))},{passive:false});
  addEventListener("mousemove",e=>{if(isPauseOpen()||document.pointerLockElement!==document.body)return;local.rot.y-=e.movementX*.0022;local.rot.x=clamp(local.rot.x-e.movementY*.0022,-1.35,1.35)});
  addEventListener("mousedown",e=>{
    if(e.target?.closest?.(".chat")||isPauseOpen())return;
    if($("hud").classList.contains("hidden"))return;
    const cardNode=e.target?.closest?.(".card");
    if(cardNode&&local.alive)setSelectedCard(parseInt(cardNode.dataset.card)||0);
    if(cardNode&&e.button!==2)return;
    if(document.pointerLockElement!==document.body)lockPointer();
    if(!local.alive)return;
    if(e.button===0)castCard();
    if(e.button===2)startChargeSkill()
  });
  addEventListener("mouseup",e=>{if(e.button===2)releaseChargeSkill()});
  addEventListener("contextmenu",e=>e.preventDefault())
}
function isUltimateCard(card,index){return index===3||card?.ultimate||card?.type==="궁극기"}
function cardInfo(card){const parts=[card.damage?"피해 "+Math.round(card.damage*local.power):"보조"];if(card.curse)parts.push("저주 "+Math.round(card.curse*local.power));if(card.heal)parts.push("회복 "+Math.round(card.heal*local.power));if(card.shield)parts.push("방어 "+Math.round(card.shield*local.power));if(card.healCut)parts.push("회복감소 "+Math.round((1-Math.max(card.healCut,.4))*100)+"%");return parts.join(" · ")}
function rightHoldInfo(card,i){if(i!==0&&i!==3)return"우클릭 없음";if(local.element==="fire"&&i===0)return"우클릭 화염차징";if(local.element==="fire"&&i===3)return"우클릭 태양차징";if(local.element==="water"&&i===0)return"우클릭 물광선";if(local.element==="psychic"&&i===3)return"우클릭 염동차징";if(local.element==="dragon"&&i===0)return"우클릭 화염빔";if(i===0&&card.type==="공격")return"우클릭 지속공격";if(i===3)return"우클릭 차징";return"우클릭 없음"}
function cardStatValue(card,key){if(key==="damage")return Math.max(0,Math.round(((card.damage||0)+(card.burn||0)+(card.poison||0)+(card.curse||0))*local.power));if(key==="mana")return Math.max(0,Math.round(card.mana||0));return Math.max(.1,Math.round(Math.max(.2,(card.cd||1)*local.cdMul)*10)/10)}
function cardStatPct(card,key){const v=cardStatValue(card,key);if(key==="damage")return clamp(v/95*100,8,100);if(key==="mana")return clamp(v/110*100,8,100);return clamp(v/65*100,8,100)}
function cardSuit(id){return id==="fire"?"🔥":id==="water"?"💧":id==="lightning"?"⚡":id==="earth"?"⛰":id==="wind"?"🌀":id==="light"?"✦":id==="darkness"?"☾":id==="poison"?"☣":id==="dragon"?"🐉":id==="psychic"?"◇":id==="summoner"?"✥":id==="hacker"?"⌘":"✹"}
function renderCardStat(card,key,label){const value=cardStatValue(card,key),pct=cardStatPct(card,key);return`<div class="card-stat ${key}"><span>${label}</span><em><i style="width:${pct}%"></i></em><b>${value}</b></div>`}
function chargePercent(){if(!local.charge)return 0;const max=local.chargeMode==="sun"?3:local.chargeMode==="psychicLift"?1.1:local.chargeMode==="stream"?1.6:local.chargeMode==="fireCharge"?2:2;return clamp(Math.round(((local.chargeTime||0)/max)*100),0,100)}
function renderChargeMeter(){const el=$("chargeMeter");if(!el)return;if(!local.charge){el.classList.add("hidden");el.innerHTML="";return}const pct=chargePercent();el.classList.remove("hidden");el.innerHTML=`<b>${pct}%</b>`}
function cardLocked(i){const slot=i+1,t=now();return local.roundSealSlot===slot||((local.skillLockUntil||0)>t&&local.lockedSkillSlot===slot)}
function renderCards(){const e=elements[local.element]||elements.fire,cards=getCards(e),id=local.element||"fire",hex=e.color.toString(16).padStart(6,"0"),suit=cardSuit(id);$("cards").innerHTML=cards.map((card,i)=>{const cd=local.cooldowns[i]||0,cdMax=Math.max(.2,(card.cd||1)*local.cdMul),cdPct=clamp(cd/cdMax*100,0,100),active=i===selectedCard,charging=local.charge&&local.chargeCard===i,locked=cardLocked(i);return`<button type="button" class="card ${active?"active":""} ${charging?"charging":""} ${locked?"locked":""}" data-card="${i}" style="--card-color:#${hex};--cd:${cdPct}%">
  <span class="card-cd ${cd>0?"":"empty"}">${cd>0?cd.toFixed(1)+"초":""}</span>${locked?`<span class="card-lock">LOCK</span>`:""}
  <span class="card-rank">${i+1}</span><span class="card-suit">${suit}</span>
  <span class="card-title">${esc(card.name)}</span>
  <span class="card-art"><i>${suit}</i></span>
  <span class="card-type">${card.type} · ${rightHoldInfo(card,i)}</span>
  <span class="card-stats">${renderCardStat(card,"damage","DMG")}${renderCardStat(card,"mana","MP")}${renderCardStat(card,"cool","CD")}</span>
</button>`}).join("");renderChargeMeter()}
function resetSpectatorState(){Object.assign(local,{spectatorMode:"free",spectatorTarget:"",spectatorPos:null,spectatorInit:false,rangePreviewAt:0});if(typeof hideSpectatorInfo==="function")hideSpectatorInfo()}
function spectatorTargets(r){const ids=Object.entries(r?.players||{}).filter(([id,p])=>id!==selfId&&p?.alive&&p.hp>0&&p.pos);const enemies=ids.filter(([,p])=>!(r.mode==="team"&&p.team===local.team));return(enemies.length?enemies:ids).map(([id])=>id)}
function initSpectator(r){if(!local.spectatorPos)local.spectatorPos={x:local.pos.x,y:Math.max(8,(local.pos.y||2)+5),z:local.pos.z};local.spectatorInit=true;if(!local.spectatorMode)local.spectatorMode="free";const targets=spectatorTargets(r);if(!local.spectatorTarget&&targets.length)local.spectatorTarget=targets[0]}
function spectatorTargetName(r,id){return r?.players?.[id]?.name||"대상 없음"}
function setSpectatorMode(mode,r=getRoom()){initSpectator(r);local.spectatorMode=mode;if(mode==="target"&&!spectatorTargets(r).includes(local.spectatorTarget))local.spectatorTarget=spectatorTargets(r)[0]||"";renderSpectatorInfo(r)}
function cycleSpectatorTarget(r=getRoom()){const targets=spectatorTargets(r);if(!targets.length){setSpectatorMode("free",r);return}const next=targets[(targets.indexOf(local.spectatorTarget)+1+targets.length)%targets.length];local.spectatorTarget=next;setSpectatorMode("target",r)}
function handleSpectatorKey(e){if(local.alive||$("hud").classList.contains("hidden"))return false;if(e.code==="KeyF"){e.preventDefault();setSpectatorMode("free");return true}if(e.code==="KeyV"){e.preventDefault();cycleSpectatorTarget();return true}if(e.code==="KeyT"){e.preventDefault();setSpectatorMode("top");return true}return false}
function hideSpectatorInfo(){const el=$("spectatorInfo");if(el)el.classList.add("hidden")}
function renderSpectatorInfo(r){const el=$("spectatorInfo");if(!el)return;const mode=local.spectatorMode==="target"?`상대시점 <b>${esc(spectatorTargetName(r,local.spectatorTarget))}</b>`:local.spectatorMode==="top"?"상단시점":"자유시점";el.classList.remove("hidden");el.innerHTML=`사망 관전 · ${mode} · F 자유 · V 상대전환 · T 상단 · WASD 이동 · Space 상승 · Ctrl 하강`}
function updateSpectator(dt,r,t){
  initSpectator(r);
  if(viewModel)viewModel.visible=false;
  if(selfVisual)selfVisual.visible=false;
  const targets=spectatorTargets(r);
  if(local.spectatorMode==="target"){
    if(!targets.includes(local.spectatorTarget))local.spectatorTarget=targets[0]||"";
    const p=r?.players?.[local.spectatorTarget];
    if(p?.pos){
      camera.position.set(p.pos.x,p.pos.y+.25,p.pos.z);
      camera.rotation.order="YXZ";
      camera.rotation.y=p.rot?.y||0;
      camera.rotation.x=p.rot?.x||0;
      renderSpectatorInfo(r);
      updatePendingHits(t);
      return;
    }
    local.spectatorMode="free";
  }
  if(local.spectatorMode==="top"){
    camera.position.set(0,96,0.01);
    camera.lookAt(0,0,0);
    renderSpectatorInfo(r);
    updatePendingHits(t);
    return;
  }
  const pos=local.spectatorPos||{x:local.pos.x,y:8,z:local.pos.z},speed=(keys.ShiftLeft?28:16)*dt,sy=Math.sin(local.rot.y),cy=Math.cos(local.rot.y),fx=-sy,fz=-cy,rx=cy,rz=-sy;
  let forward=0,strafe=0,up=0;
  if(keys.KeyW)forward+=1;if(keys.KeyS)forward-=1;if(keys.KeyA)strafe-=1;if(keys.KeyD)strafe+=1;if(keys.Space)up+=1;if(keys.ControlLeft||keys.ControlRight)up-=1;
  const len=Math.hypot(forward,strafe)||1;
  pos.x+=(fx*forward/len+rx*strafe/len)*speed;
  pos.z+=(fz*forward/len+rz*strafe/len)*speed;
  pos.y=clamp(pos.y+up*speed,3,96);
  constrainArenaPosition(pos);
  local.spectatorPos=pos;
  camera.position.set(pos.x,pos.y,pos.z);
  camera.rotation.order="YXZ";
  camera.rotation.y=local.rot.y;
  camera.rotation.x=local.rot.x;
  renderSpectatorInfo(r);
  updatePendingHits(t);
}
function getCards(e){const arr=e.cards.map(x=>({...x})),id=local.element||"fire";if(arr[3])Object.assign(arr[3],{type:"궁극기",ultimate:true});if(local.dragonComplete&&id==="dragon"){arr[0]=c("하늘 브레스","공격",55,8,62,{burn:10,wide:true});arr[1]=c("용의 물어뜯기","공격",36,10,86,{bite:true,shieldBreak:.35});arr[2]=c("용의 발 내려찍기","CC기",58,16,68,{stun:1.2,dragonStomp:true});arr[3]=c("절대 포식","궁극기",110,45,90,{ultimate:true,devour:true,executeBelow:.25,healCut:.4})}if(id==="summoner"){const s=local.spirit||"fire";arr[0].name=({fire:"불 정령탄",water:"물 정령탄",wind:"바람 정령탄",earth:"땅 정령탄"})[s]||arr[0].name;if(s==="fire")arr[0].burn=4;if(s==="water")arr[0].heal=2;if(s==="wind")arr[0].knock=.35;if(s==="earth")arr[0].shieldBreak=.08;if(arr[2]){if(s==="fire")arr[2].burn=6;if(s==="water")arr[2].slow=1.5;if(s==="wind")arr[2].knock=1;if(s==="earth")arr[2].slow=1.8}}if(local.evolve>=1&&arr[0])arr[0].damage=Math.round((arr[0].damage||0)*1.1);if(local.evolve>=2&&arr[1]){arr[1].shield=Math.round((arr[1].shield||0)*1.15);arr[1].heal=Math.round((arr[1].heal||0)*1.15)}if(local.evolve>=3&&arr[2]){arr[2].damage=Math.round((arr[2].damage||0)*1.15);if(arr[2].stun)arr[2].stun=Math.min(1.6,arr[2].stun*1.15);if(arr[2].slow)arr[2].slow*=1.15}if(local.evolve>=5){arr[3]={...arr[3],type:"궁극기",ultimate:true,name:"최종진화 " + arr[3].name,damage:Math.round((arr[3].damage||0)*1.2),shield:(arr[3].shield||0)+20,heal:(arr[3].heal||0)+15};if(id==="fire"||id==="dragon")arr.forEach(x=>{if(x.burn)x.burn+=4});if(id==="earth"&&arr[1])arr[1].shield=Math.round((arr[1].shield||0)*1.1);if(id==="light"&&arr[1])arr[1].heal=Math.round((arr[1].heal||0)*1.1);if(id==="poison")arr.forEach(x=>{if(x.poison)x.poison+=3});if(id==="lightning"&&arr[2])arr[2].damage+=4;if(id==="hacker"&&arr[2])arr[2].shortLock=.15}if(local.devil)arr.forEach((x,i)=>{x.name="악마의 "+x.name;x.damage=Math.round((x.damage||0)*1.12);if(x.damage>0)x.curse=(x.curse||0)+(i===3?10:i===2?6:4);x.drain=(x.drain||0)+.1;x.mana=Math.ceil((x.mana||0)*1.1);if(i===3){Object.assign(x,{type:"궁극기",ultimate:true});x.healCut=Math.max(.4,(x.healCut||.5)-.15)}});if(local.oluo){arr[0]={...arr[0],name:"올루오푸스의 손아귀",damage:20,mana:18,cd:1.4,drain:.1,curse:6};arr[1]={...arr[1],name:"초월의 왕관",type:"방어",damage:0,mana:38,cd:18,shield:50,heal:0};arr[2]={...arr[2],name:"심연의 지배",type:"CC기",damage:18,mana:44,cd:22,stun:.12,slow:2,curse:8};arr[3]={...arr[3],name:"강림: 세계 포식",type:"궁극기",ultimate:true,damage:75,mana:100,cd:65,healCut:.4,slow:2.5,pull:1,curse:16,drain:.16}}return arr}
function animate(){gameLoop=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);const r=getRoom();if(!r||r.phase!=="battle")return;updateLocal(dt,r);updateOpponents(r);updateEffects(dt);updateHud(r);updateNameplates(r);renderer.render(scene,camera)}
function constrainArenaPosition(pos){const d=Math.hypot(pos.x,pos.z);if(d>moveLimit){pos.x=pos.x/d*moveLimit;pos.z=pos.z/d*moveLimit}}
function healValue(v,actor=local){return Math.round(v*(now()<(actor.healCutUntil||0)?actor.healCutMul||.5:1))}
function healLocal(v){local.hp=clamp(local.hp+healValue(v),0,local.maxHp)}
function updateLocal(dt,r){
if(isPauseOpen())return;
const t=now();
if(!local.alive){updateSpectator(dt,r,t);return}
hideSpectatorInfo();
if(viewModel)viewModel.visible=true;
if(selfVisual)selfVisual.visible=true;
const stunned=t<local.stunUntil;
if(local.psychicLiftReadyUntil&&t>local.psychicLiftReadyUntil){local.psychicLiftReadyUntil=0;local.psychicLiftCharge=0}
local.cooldowns=local.cooldowns.map(x=>Math.max(0,x-dt));
if(t-lastCardRender>90){renderCards();lastCardRender=t}
if(stunned&&local.charge)clearChargeSkill();
if(local.charge){
  local.chargeTime=(local.chargeTime||0)+dt;
  updateChargeSkill(dt,t);
  if(local.chargeMode!=="stream")local.mana=clamp(local.mana+manaRegenRate()*dt,0,local.maxMana);
}else local.mana=clamp(local.mana+manaRegenRate()*dt,0,local.maxMana);
if(local.dragonComplete&&t>(local.dragonRegenBlockedUntil||0))local.hp=clamp(local.hp+35*dt,0,local.maxHp);
const base=(t<local.speedUntil?9:6.5)*(local.moveBase||1)*local.move*(t<local.slowUntil?.55:1);let forward=0,strafe=0;
if(!stunned&&!local.dashState){if(keys.KeyW)forward+=1;if(keys.KeyS)forward-=1;if(keys.KeyA)strafe-=1;if(keys.KeyD)strafe+=1}
const len=Math.hypot(forward,strafe)||1,sy=Math.sin(local.rot.y),cy=Math.cos(local.rot.y),fx=-sy,fz=-cy,rx=cy,rz=-sy;
local.vel.x=(fx*forward/len+rx*strafe/len)*base;local.vel.z=(fz*forward/len+rz*strafe/len)*base;
if(keys.ShiftLeft&&!stunned){dash();keys.ShiftLeft=false}
if(keys.Space&&local.pos.y<=2.02&&!stunned&&!local.dashState){jump();keys.Space=false}
const dashing=updateDash(dt,t);local.vel.y-=20*dt;
if(!dashing){local.pos.x+=local.vel.x*dt;local.pos.z+=local.vel.z*dt;constrainArenaPosition(local.pos)}
local.pos.y+=local.vel.y*dt;if(local.pos.y<2){local.pos.y=2;local.vel.y=0}
camera.position.set(local.pos.x,local.pos.y,local.pos.z);
if(selfVisual){if(visualChanged(selfVisual,local)){refreshSelfVisual();refreshViewModel()}selfVisual.position.set(local.pos.x,local.pos.y-1.55,local.pos.z);selfVisual.rotation.y=local.rot.y;updateAvatar(selfVisual,dt)}
if(viewModel){viewModel.userData.kick=Math.max(0,(viewModel.userData.kick||0)-dt*1.8);viewModel.userData.pulse=Math.max(0,(viewModel.userData.pulse||0)-dt*2.4);viewModel.position.z=-(viewModel.userData.kick||0);viewModel.rotation.x=-(viewModel.userData.kick||0)*1.6;viewModel.rotation.z=Math.sin(performance.now()*.004)*.08+(viewModel.userData.pulse||0)}
camera.rotation.order="YXZ";camera.rotation.y=local.rot.y;camera.rotation.x=local.rot.x;
updatePendingHits(t);
if(t-lastSync>90){patch({hp:local.hp,maxHp:local.maxHp,shield:local.shield,mana:Math.round(local.mana),pos:local.pos,rot:local.rot,alive:local.alive,cooldowns:[...(local.cooldowns||[0,0,0,0])],dashCdUntil:local.dashCdUntil||0,dragonQCdUntil:local.dragonQCdUntil||0,stunUntil:local.stunUntil||0,slowUntil:local.slowUntil||0,ccResistUntil:local.ccResistUntil||0,speedUntil:local.speedUntil||0,healCutUntil:local.healCutUntil||0,healCutMul:local.healCutMul||1,skillLockUntil:local.skillLockUntil||0,lockedSkillSlot:local.lockedSkillSlot||0,skillLockResistUntil:local.skillLockResistUntil||0,roundSealSlot:local.roundSealSlot||0,roundSealSource:local.roundSealSource||"",dragonRegenBlockedUntil:local.dragonRegenBlockedUntil||0,parryUntil:local.parryUntil||0,parryBonusUntil:local.parryBonusUntil||0,parryBonusStun:local.parryBonusStun||0,parryTarget:local.parryTarget||"",coins:local.coins,totalCoins:local.totalCoins||0,spent:local.spent||0,kills:local.kills||0,deaths:local.deaths||0,damageDone:local.damageDone||0,damageTaken:local.damageTaken||0,power:local.power,move:local.move,moveBase:local.moveBase||1,cdMul:local.cdMul,evolve:local.evolve,crowns:local.crowns,coinBonus:local.coinBonus||0,drain:local.drain||0,devil:local.devil,oluo:local.oluo,dragonParts:{...(local.dragonParts||{})},dragonComplete:!!local.dragonComplete,spirit:local.spirit||"fire",upgradeCounts:{...(local.upgradeCounts||{})},secondaryElements:local.secondaryElements||[]});lastSync=t}
}
function manaRegenRate(){return Math.min(12,6+(local.evolve>=4?1:0)+(local.oluo?2:0))}
function clearChargeSkill(){local.charge=false;local.chargeMode="";local.chargeTime=0;local.chargeTick=0;local.chargeFxTick=0;if($("cards")&&!$("hud").classList.contains("hidden"))renderCards();else renderChargeMeter()}
function triggerAltParry(){if(!local.alive||now()<local.stunUntil)return;local.parryUntil=now()+100;parryFlashEffect();patch({parryUntil:local.parryUntil});log("순간 패링")}
function parryFlashEffect(){if(!scene)return;const guard=new THREE.Mesh(new THREE.TorusGeometry(1.05,.055,8,64),effectMaterial(0xffffff,.72));guard.rotation.x=Math.PI/2;addEffect(guard,{x:local.pos.x,y:local.pos.y-.55,z:local.pos.z},.18,1.55);burstShape({x:local.pos.x,y:local.pos.y+.35,z:local.pos.z},0xffffff,8,"spark",.85)}
function startChargeSkill(){if(!local.alive||now()<local.stunUntil)return;const e=elements[local.element]||elements.fire,cards=getCards(e),card=cards[selectedCard];if(!card)return;if(selectedCard!==0&&selectedCard!==3){log("이 카드는 우클릭 기능이 없습니다.");return}if(card.type==="방어"){log("방어 카드는 우클릭 기능이 없습니다.");return}if(cardLocked(selectedCard)){log("해당 카드가 봉인되어 있습니다.");return}if(local.element==="fire"&&selectedCard===0)local.chargeMode="fireCharge";else if(local.element==="fire"&&selectedCard===3)local.chargeMode="sun";else if(local.element==="water"&&selectedCard===0)local.chargeMode="stream";else if(local.element==="psychic"&&selectedCard===3)local.chargeMode="psychicLift";else if(local.element==="dragon"&&selectedCard===0)local.chargeMode="dragonBeam";else if(selectedCard===0&&card.type==="공격")local.chargeMode="stream";else if(selectedCard===3)local.chargeMode="charge";else{log("이 카드는 우클릭 기능이 없습니다.");return}if((local.chargeMode==="sun"||local.chargeMode==="psychicLift"||local.chargeMode==="charge")&&(local.cooldowns[selectedCard]||0)>0){log("카드 쿨타임입니다.");local.chargeMode="";return}local.charge=true;local.chargeCard=selectedCard;local.chargeTime=0;local.chargeTick=0;local.chargeFxTick=0;renderCards();chargePreviewEffect(true);log(local.chargeMode==="fireCharge"?"화염탄 차징 시작":local.chargeMode==="stream"?"지속 공격 시작":local.chargeMode==="dragonBeam"?"화염 빔 시작":local.chargeMode==="sun"?"태양 차징 시작":local.chargeMode==="psychicLift"?"염동 포획 차징":"마나 차징 시작")}
function releaseChargeSkill(){if(!local.charge)return;const held=local.chargeTime||0,cardIndex=local.chargeCard,mode=local.chargeMode;clearChargeSkill();if(mode==="sun"&&cardIndex===3&&held>.22)throwFireSun(held);else if(mode==="psychicLift"&&cardIndex===3&&held>.16)armPsychicLift(held);else if((mode==="charge"||mode==="fireCharge")&&held>.28)throwChargedCard(cardIndex,held)}
function updateChargeSkill(dt,t){if(!local.charge||!scene){renderChargeMeter();return}renderChargeMeter();if(local.chargeMode==="stream"||local.chargeMode==="dragonBeam"){if(local.chargeMode==="dragonBeam"&&local.chargeTime>3){clearChargeSkill();log("화염 빔 과열");return}local.chargeFxTick-=dt;local.chargeTick-=dt;if(local.chargeFxTick<=0){chargePreviewEffect(false);local.chargeFxTick=.055}if(local.chargeTick<=0){continuousAttackTick();local.chargeTick=local.chargeMode==="stream"&&local.element==="water"?.09:.16}}else if(local.chargeMode==="psychicLift"){local.chargeFxTick-=dt;if(local.chargeFxTick<=0){chargePreviewEffect(false);local.chargeFxTick=.075}}else{local.chargeFxTick-=dt;if(local.chargeFxTick<=0){chargePreviewEffect(false);local.chargeFxTick=.11}}}
function chargePreviewEffect(burst=false){if(!scene)return;const e=elements[local.element]||elements.fire,color=e.color,sy=Math.sin(local.rot.y),cy=Math.cos(local.rot.y),front={x:local.pos.x-sy*1.1,y:local.pos.y+.25,z:local.pos.z-cy*1.1};if(local.chargeMode==="sun"){const s=clamp(.55+(local.chargeTime||0)*.45,.55,1.45),sun=new THREE.Mesh(new THREE.SphereGeometry(s,24,16),effectMaterial(0xffb23a,.42));addEffect(sun,{x:front.x,y:front.y+1.1,z:front.z},burst?.55:.18,1.08);ringAt({x:front.x,y:front.y+1.1,z:front.z},0xfff08a,s*.9,burst?.55:.22);burstShape({x:front.x,y:front.y+1.1,z:front.z},0xff6a2a,burst?16:4,"flame",s*1.5)}else if(local.chargeMode==="fireCharge"){const pct=clamp((local.chargeTime||0)/2,.12,1),p={x:front.x,y:front.y+.55,z:front.z},s=.3+pct*.78,orb=new THREE.Mesh(new THREE.SphereGeometry(s,24,16),effectMaterial(0xff6a2a,.5));addEffect(orb,p,burst?.42:.16,1.12);ringAt(p,0xfff08a,s*.9,burst?.42:.2);burstShape(p,0xff4d37,burst?18:5,"flame",1+pct*1.4)}else if(local.chargeMode==="psychicLift"){const pct=clamp((local.chargeTime||0)/1.1,.08,1),core=new THREE.Mesh(new THREE.IcosahedronGeometry(.28+pct*.34,1),effectMaterial(0xd6a6ff,.48));addEffect(core,{x:front.x,y:front.y+.72,z:front.z},burst?.42:.16,1.12);for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry((.48+pct*.38)+i*.18,.024,8,72),effectMaterial(i?color:0xffffff,.52));ring.rotation.x=Math.PI/2+i*.38;ring.rotation.z=performance.now()*.002+i;addEffect(ring,{x:front.x,y:front.y+.72+i*.04,z:front.z},burst?.45:.18,1.22)}burstShape({x:front.x,y:front.y+.72,z:front.z},color,burst?18:5,"spark",.9+pct*.75)}else if(local.chargeMode==="stream"){const tip={x:front.x,y:front.y-.25,z:front.z};if(local.element==="water"){strikeBeam({x:front.x,y:front.y+.15,z:front.z},{x:front.x-sy*3.2,y:front.y+.05,z:front.z-cy*3.2},0x90e7ff,.08,burst?.28:.14,1.03)}burstShape(tip,color,burst?12:4,local.element==="earth"?"rock":local.element==="lightning"?"bolt":"bubble",burst?1.2:.65);if(burst)ringAt(tip,color,.55,.35)}else{const aura=new THREE.Mesh(new THREE.TorusGeometry(.8,.045,8,56),effectMaterial(color,.6));aura.rotation.x=Math.PI/2;addEffect(aura,{x:local.pos.x,y:local.pos.y-.95,z:local.pos.z},burst?.55:.25,1.7)}}
function continuousAttackTick(){const e=elements[local.element]||elements.fire,base=getCards(e)[local.chargeCard];let cost=Math.max(3,Math.round((base.mana||10)*.42)),card={...base,name:"연속 "+base.name,mana:0,cd:.1,damage:Math.max(3,Math.round((base.damage||10)*.42)),stream:true};if(local.chargeMode==="dragonBeam"){cost=3;card={...base,name:"화염 빔",mana:0,cd:.1,damage:5,burn:2,stream:true,beam:true}}if(local.mana<cost){clearChargeSkill();log("마나 부족으로 지속 공격이 멈췄습니다.");return}local.mana=clamp(local.mana-cost,0,local.maxMana);if(card.burn)card.burn=Math.max(2,Math.round(card.burn*.45));if(card.poison)card.poison=Math.max(2,Math.round(card.poison*.45));if(card.drain)card.drain=Math.min(.16,card.drain);if(card.slow)card.slow=Math.min(.65,card.slow*.45);const queued=queueSkillHit(card,e);recordSkillFx(card,null,queued);useCastMotion(card);patch({mana:Math.round(local.mana),parryUntil:0,cooldowns:[...(local.cooldowns||[0,0,0,0])]})}
function waterStreamTick(){continuousAttackTick()}
function armPsychicLift(held){local.psychicLiftCharge=clamp(held,.18,1.1);local.psychicLiftReadyUntil=now()+5000;chargePreviewEffect(true);renderCards();log(`염동 포획 준비 ${local.psychicLiftCharge.toFixed(1)}초 · 좌클릭으로 발사`)}
function castPsychicLiftShot(base){if(local.element!=="psychic"||selectedCard!==3||now()>(local.psychicLiftReadyUntil||0))return false;if((local.cooldowns[3]||0)>0){log(`중력 역전 쿨타임 ${(local.cooldowns[3]||0).toFixed(1)}초`);return true}const charge=clamp(local.psychicLiftCharge||0,.18,1.1),cost=Math.max(34,Math.round((base.mana||42)*(1+charge*.16)));if(local.mana<cost){log(`마나 부족: ${Math.round(local.mana)} / ${cost}`);return true}const e=elements.psychic,card={...base,name:"염동 포획",type:"궁극기",ultimate:true,mana:cost,cd:base.cd||38,damage:0,stun:0,slow:0,gravity:false,healCut:0,psychicLift:true,psychicLiftDuration:charge,psychicLiftSlamDamage:10,charge:charge/1.1};local.mana=clamp(local.mana-cost,0,local.maxMana);local.cooldowns[3]=Math.max(.8,(base.cd||38)*local.cdMul);local.psychicLiftReadyUntil=0;local.psychicLiftCharge=0;const queued=queueSkillHit(card,e);recordSkillFx(card,null,queued);useCastMotion(card);patch({mana:Math.round(local.mana),cooldowns:[...(local.cooldowns||[0,0,0,0])]});renderCards();log("염동 포획 발사");return true}
function throwFireSun(held){const e=elements.fire,base=getCards(e)[3],charge=clamp(held/1.8,.25,1),required=Math.max(35,Math.round((base.mana||70)*.55));if((local.cooldowns[3]||0)>0){log("궁극기 쿨타임입니다.");return}if(local.mana<required){log(`마나 부족: 태양 투척은 ${required} 마나가 필요합니다.`);return}const cost=Math.min(local.mana,Math.round(required+charge*24)),card={...base,name:"태양 투척",mana:cost,damage:Math.round((base.damage||42)*(1+charge*.8)),burn:(base.burn||0)+Math.round(8+charge*10),sun:true,charge};local.mana=clamp(local.mana-cost,0,local.maxMana);local.cooldowns[3]=Math.max(.8,base.cd*local.cdMul);const queued=queueSkillHit(card,e);recordSkillFx(card,null,queued);useCastMotion(card);patch({mana:Math.round(local.mana),cooldowns:[...(local.cooldowns||[0,0,0,0])],coins:local.coins,totalCoins:local.totalCoins||0,kills:local.kills||0});renderCards();log("태양 투척 사용")}
function castDragonQ(){if(local.element!=="dragon"||!local.alive||now()<local.stunUntil)return;const t=now();if(t<(local.dragonQCdUntil||0)){log(`용의 불 쿨타임 ${((local.dragonQCdUntil-t)/1000).toFixed(1)}초`);return}const cost=14;if(local.mana<cost){log(`마나 부족: ${Math.round(local.mana)} / ${cost}`);return}const e=elements.dragon,card={name:"용의 불 발사",type:"공격",mana:cost,cd:2.5,damage:18,burn:7,dragonQ:true};local.mana-=cost;local.dragonQCdUntil=t+2500;const queued=queueSkillHit(card,e);recordSkillFx(card,null,queued);useCastMotion(card);patch({mana:Math.round(local.mana),dragonQCdUntil:local.dragonQCdUntil});log("용의 불 발사")}
function throwChargedCard(cardIndex,held){const e=elements[local.element]||elements.fire,base=getCards(e)[cardIndex];if(!base)return;if((local.cooldowns[cardIndex]||0)>0){log("차징 카드 쿨타임입니다.");return}const charge=clamp(held/2,.18,1),cost=Math.min(local.mana,Math.round((base.mana||20)*(1+charge*.25)));if(local.mana<cost){log(`마나 부족: ${Math.round(local.mana)} / ${cost}`);return}const card={...base,name:"차징 "+base.name,mana:cost,damage:Math.round((base.damage||0)*(1+charge*.45)),charge};if(card.burn)card.burn=Math.round(card.burn*(1+charge*.35));if(card.poison)card.poison=Math.round(card.poison*(1+charge*.35));if(card.slow)card.slow=Math.min(4,card.slow*(1+charge*.12));local.mana=clamp(local.mana-cost,0,local.maxMana);local.cooldowns[cardIndex]=Math.max(.8,(base.cd||1)*local.cdMul);const queued=card.damage>0?queueSkillHit(card,e):null;if(!queued)skillEffect(card,null,e,local,aimEndpoint(card,local));recordSkillFx(card,null,queued);useCastMotion(card);patch({mana:Math.round(local.mana),cooldowns:[...(local.cooldowns||[0,0,0,0])],coins:local.coins,totalCoins:local.totalCoins||0,kills:local.kills||0});renderCards();log(card.name+" 사용")}
function dashConfig(id){const boost=(local.evolve>=4?1.1:1)*(local.dragonParts?.wing?1.15:1)*(local.dragonComplete?1.25:1),cd=dashBaseCooldown;return id==="lightning"?{dist:8.6*boost,dur:.075,step:12,cd}:id==="wind"?{dist:8.9*boost,dur:.15,step:18,cd}:id==="earth"?{dist:5.8*boost,dur:.22,step:28,cd}:id==="water"?{dist:6.6*boost,dur:.22,step:24,cd}:id==="light"?{dist:7.2*boost,dur:.13,step:16,cd}:id==="darkness"?{dist:7.3*boost,dur:.14,step:18,cd}:id==="poison"?{dist:6.4*boost,dur:.2,step:24,cd}:id==="dragon"?{dist:7.4*boost,dur:.16,step:18,cd}:id==="psychic"?{dist:7.1*boost,dur:.15,step:18,cd}:id==="hacker"?{dist:7.6*boost,dur:.12,step:14,cd}:{dist:6.8*boost,dur:.18,step:20,cd}}
function dashDirection(){const sy=Math.sin(local.rot.y),cy=Math.cos(local.rot.y),fx=-sy,fz=-cy,rx=cy,rz=-sy;let forward=0,strafe=0;if(keys.KeyW)forward+=1;if(keys.KeyS)forward-=1;if(keys.KeyA)strafe-=1;if(keys.KeyD)strafe+=1;if(!forward&&!strafe)forward=1;const len=Math.hypot(forward,strafe)||1;return{x:(fx*forward+rx*strafe)/len,z:(fz*forward+rz*strafe)/len}}
function dash(){if(local.dashState)return;const t=now();if(t<(local.dashCdUntil||0)){log(`대쉬 쿨타임 ${((local.dashCdUntil-t)/1000).toFixed(1)}초`);return}const e=elements[local.element]||elements.fire,cfg=dashConfig(local.element),dir=dashDirection(),from={x:local.pos.x,y:local.pos.y,z:local.pos.z},to={x:from.x+dir.x*cfg.dist,y:from.y,z:from.z+dir.z*cfg.dist};constrainArenaPosition(to);local.dashState={id:local.element||"fire",color:e.color,from,to,dir,t:0,dur:cfg.dur,step:cfg.step,lastTrail:0,prev:{...from},devil:local.devil,oluo:local.oluo,dragonTail:local.dragonParts?.tail||local.dragonComplete};local.dashCdUntil=t+cfg.cd;if(local.element==="light")local.shield=Math.min(120,(local.shield||0)+5);local.vel.x=0;local.vel.z=0;dashTrail(local.dashState,true);patch({hp:local.hp,shield:local.shield,dashCdUntil:local.dashCdUntil});log(e.dash)}
function updateDash(dt,t){const d=local.dashState;if(!d)return false;d.t+=dt;const k=clamp(d.t/d.dur,0,1),ease=1-Math.pow(1-k,3);d.prev={x:local.pos.x,y:local.pos.y,z:local.pos.z};local.pos.x=d.from.x+(d.to.x-d.from.x)*ease;local.pos.z=d.from.z+(d.to.z-d.from.z)*ease;constrainArenaPosition(local.pos);if(!d.lastTrail||t-d.lastTrail>d.step){dashTrail(d,false);d.lastTrail=t}if(k>=1){dashTrail(d,true);if(d.dragonTail)dragonTailShockwave();local.dashState=null}return true}
function dragonTailShockwave(){const r=getRoom();if(!r)return;Object.entries(r.players).forEach(([id,p])=>{if(id===selfId||!p.alive||p.hp<=0||!p.pos)return;if(r.mode==="team"&&p.team===local.team)return;const d=Math.hypot(p.pos.x-local.pos.x,p.pos.z-local.pos.z);if(d>7+targetHitboxRadius(p))return;hitTarget({id,p,d,hit:targetHitPoint(p)}, {name:"드래곤 꼬리 충격파",type:"CC기",damage:10,slow:1,knock:.6}, elements.dragon||elements.fire)})}
function dashTrail(d,burst=false){if(!scene)return;const id=d.id,color=d.color,pos=local.pos,tail={x:pos.x-d.dir.x*.9,y:pos.y-.85,z:pos.z-d.dir.z*.9};if(id==="fire"){const flame=new THREE.Mesh(new THREE.ConeGeometry(burst?.32:.2,burst?1.3:.8,12),effectMaterial(0xff4d37,.82));flame.rotation.x=Math.PI/2;flame.rotation.z=Math.atan2(d.dir.z,d.dir.x);addEffect(flame,tail,.45,2.1);burstShape(tail,0xff5a2e,burst?16:6,"flame",burst?1.5:.8)}else if(id==="lightning"){strikeBeam(d.prev||tail,pos,0xfff36a,.055,.22,1.02);burstShape(pos,0xfff36a,burst?18:8,"bolt",burst?1.4:.8)}else if(id==="water"){const drop=new THREE.Mesh(new THREE.SphereGeometry(burst?.28:.16,12,8),effectMaterial(0x38a8ff,.48));drop.scale.y=.55;addEffect(drop,tail,.5,2.2);if(burst)ringAt(pos,0x38a8ff,.9,.5);burstShape(tail,0x38a8ff,burst?14:5,"bubble",1.1)}else if(id==="earth"){const dust=new THREE.Mesh(new THREE.DodecahedronGeometry(burst?.24:.14,0),effectMaterial(0x9b7352,.72));dust.scale.y=.45;addEffect(dust,tail,.55,1.7);if(burst)ringAt(pos,0x8a5a32,1,.55);burstShape(tail,0x9b7352,burst?12:4,"rock",1)}else if(id==="wind"){const swirl=new THREE.Mesh(new THREE.TorusGeometry(burst?.75:.45,.026,8,48),effectMaterial(0x35f2cd,.62));swirl.rotation.x=Math.PI/2;swirl.rotation.z=Math.random()*Math.PI;addEffect(swirl,tail,.45,1.7);burstShape(tail,0x35f2cd,burst?12:5,"spark",1.2)}else if(id==="light"){strikeBeam(d.prev||tail,pos,0xfff5b6,.075,.25,1.03);const halo=new THREE.Mesh(new THREE.TorusGeometry(burst?.75:.42,.035,8,48),effectMaterial(0xfff5b6,.68));halo.rotation.x=Math.PI/2;addEffect(halo,tail,.45,1.8);burstShape(tail,0xfff5b6,burst?14:5,"spark",1)}else if(id==="darkness"){const shade=new THREE.Mesh(new THREE.SphereGeometry(burst?.42:.24,16,10),effectMaterial(0xa66cff,.28));shade.scale.y=.55;addEffect(shade,tail,.5,2.4);if(burst){const ring=new THREE.Mesh(new THREE.TorusKnotGeometry(.55,.06,48,6),effectMaterial(0x180024,.8));addEffect(ring,pos,.5,1.7)}burstShape(tail,0xa66cff,burst?12:5,"spark",1)}else{const cloud=new THREE.Mesh(new THREE.SphereGeometry(burst?.45:.24,14,9),effectMaterial(0x58e35b,.3));cloud.scale.y=.55;addEffect(cloud,tail,.65,2.3);burstShape(tail,0x58e35b,burst?16:6,"bubble",1.35)}if(typeof dashSignature==="function")dashSignature(d,tail,pos,burst)}
function jump(){const e=elements[local.element]||elements.fire;local.vel.y=local.element==="wind"?11:local.element==="earth"?7.5:9;if(local.element==="light")healLocal(3);log(e.jump)}
function nextSpirit(){const order=["fire","water","wind","earth"],i=order.indexOf(local.spirit||"fire");return order[(i+1+order.length)%order.length]}
function applySpiritSwap(){local.spirit=nextSpirit();if(local.spirit==="fire")spawn(local.pos,0xff4d37,12);else if(local.spirit==="water")healLocal(6);else if(local.spirit==="wind")local.speedUntil=now()+1500;else if(local.spirit==="earth")local.shield=Math.min(120,(local.shield||0)+10);log("정령 교대: "+({fire:"불",water:"물",wind:"바람",earth:"땅"})[local.spirit])}
function castCard(){if(!local.alive){log("관전 중에는 카드를 사용할 수 없습니다.");return}const e=elements[local.element]||elements.fire,cards=getCards(e),card=cards[selectedCard],cd=local.cooldowns[selectedCard]||0;if(!card)return;if(now()<local.stunUntil){log("기절 중에는 카드를 사용할 수 없습니다.");return}if(cardLocked(selectedCard)){log("해당 카드가 해커 효과로 잠겨 있습니다.");return}if(local.element==="psychic"&&selectedCard===3&&local.charge&&local.chargeMode==="psychicLift"){const held=local.chargeTime||0;clearChargeSkill();armPsychicLift(held);castPsychicLiftShot(card);return}if(local.element==="psychic"&&selectedCard===3&&local.psychicLiftReadyUntil>now()){castPsychicLiftShot(card);return}if(cd>0){log(`${card.name} 쿨타임 ${cd.toFixed(1)}초`);return}if(local.mana<card.mana){log(`마나 부족: ${Math.round(local.mana)} / ${card.mana}`);return}clearChargeSkill();local.mana-=card.mana;local.cooldowns[selectedCard]=Math.max(.55,card.cd*local.cdMul);let queued=null;if(card.spiritSwap)applySpiritSwap();if(card.shield)local.shield=Math.min(120,local.shield+Math.round(card.shield*local.power));if(card.heal)healLocal(Math.round(card.heal*local.power));if(card.speed)local.speedUntil=now()+card.speed*1000;if(card.damage>0)queued=queueSkillHit(card,e);patch({hp:local.hp,shield:local.shield,mana:Math.round(local.mana),cooldowns:[...(local.cooldowns||[0,0,0,0])],speedUntil:local.speedUntil||0,spirit:local.spirit||"fire",parryUntil:local.parryUntil||0,parryBonusUntil:local.parryBonusUntil||0,parryBonusStun:local.parryBonusStun||0,parryTarget:local.parryTarget||"",coins:local.coins,totalCoins:local.totalCoins||0,kills:local.kills||0});if(!queued)skillEffect(card,null,e,local,aimEndpoint(card,local));recordSkillFx(card,null,queued);useCastMotion(card);renderCards();log(card.name+" 사용")}
function aimVector(caster=local){const rot=caster.rot||{x:0,y:0},pitch=clamp(rot.x||0,-1.18,1.18),cp=Math.cos(pitch);return{x:-Math.sin(rot.y||0)*cp,y:Math.sin(pitch),z:-Math.cos(rot.y||0)*cp}}
function aimDirection(caster=local){const v=aimVector(caster),len=Math.hypot(v.x,v.z)||1;return{x:v.x/len,z:v.z/len}}
function targetHitPoint(p){return{x:p.pos.x,y:(p.pos.y||2)+1.05,z:p.pos.z}}
function targetHitboxRadius(p){return p?.dragonComplete?2.2:p?.element==="dragon"?1.75:1.45}
function cardRange(card){return isUltimateCard(card)?arenaRadius*2+32:82}
function skillProjectileSpeed(id,card){if(card?.psychicLift)return 6;if(card?.wave)return 3.8;if(card?.shield||card?.heal||card?.gravity||card?.roundSeal)return 0;if(card?.sun)return clamp(5-(card.charge||0)*2,3,5);if(card?.stream)return id==="lightning"||id==="light"||id==="dragon"?10:id==="wind"||id==="hacker"?9:id==="water"||id==="poison"||id==="psychic"?8:id==="earth"?6:7;if(isUltimateCard(card))return id==="dragon"?0:id==="fire"?4:id==="water"?5:id==="lightning"?10:id==="earth"?5:id==="wind"?1:id==="light"?10:id==="darkness"?4:id==="poison"||id==="summoner"?2:id==="hacker"?0:4;if(crowdControlCard(card))return id==="dragon"?0:id==="fire"?0:id==="water"?6:id==="lightning"?10:id==="earth"?5:id==="wind"?6:id==="light"?9:id==="darkness"?7:id==="poison"?5:id==="psychic"?9:id==="hacker"?8:6;return id==="lightning"||id==="light"?10:id==="hacker"||id==="wind"?9:id==="water"||id==="poison"||id==="psychic"?8:id==="fire"||id==="darkness"||id==="dragon"||id==="summoner"?7:id==="earth"?6:7}
function cardHitRadius(card,along=0,id=local.element||"fire"){let base=4.8;if(id==="lightning"||id==="light"||id==="hacker")base=3.6;if(id==="wind")base=4.2;if(id==="earth")base=5.7;if(id==="darkness")base=5.4;if(id==="poison")base=4.9;if(id==="dragon")base=5.6;if(id==="psychic")base=4.5;if(id==="summoner")base=4.2;if(card?.psychicLift)base=5.4;if(card?.stream)base=Math.max(3.7,base-.4);if(card?.waterBubble)base=6.4;if(card?.wave)base=7.8;if(card?.beam)base=5.4;if(crowdControlCard(card))base+=id==="light"||id==="wind"||id==="hacker"?1.3:2;if(isUltimateCard(card)&&!card?.wave)base+=id==="water"?5:id==="dragon"?7:id==="psychic"?5:id==="wind"?4:id==="darkness"?4:id==="poison"?3.6:3;if(card?.sun)base=12.5;if(card?.charge)base+=card.charge*1.2;return base+Math.min(5.2,Math.max(0,along)*.04)}
function impactHitRadius(card,id=local.element||"fire"){if(card?.shield||card?.heal)return 0;if(card?.wave)return 0;if(card?.firePillar)return 9.2;if(card?.waterBubble)return 4.8;if(card?.psychicLift)return 8.5;if(card?.sun)return 15+(card.charge||0)*2.5;if(card?.dragonSlam)return 16;if(card?.gravity)return 13;if(card?.roundSeal)return 12;if(isUltimateCard(card))return id==="dragon"?14:id==="psychic"?13:id==="water"?13:id==="wind"?12:id==="darkness"?13:id==="poison"?11:id==="earth"?10:id==="fire"?11:8.5;if(crowdControlCard(card))return id==="dragon"?8:id==="psychic"?7:id==="hacker"?6.2:id==="fire"?8.5:id==="earth"?7.2:id==="poison"?7:id==="lightning"?5.8:id==="light"?6.4:6.8;return id==="dragon"?6:id==="fire"||id==="darkness"?5.5:4.6}
function areaTelegraphCard(card,id=local.element||"fire"){if(!card||card.stream||card.type==="방어"||card.heal||card.shield)return false;if(card.areaTelegraph||card.firePillar||card.wave||card.sun||card.gravity||card.roundSeal||card.dragonSlam||card.spiritGrand||card.psychicLift||card.devour)return true;if(isUltimateCard(card))return true;return id==="lightning"&&card.type==="공격"}
function aimEndpoint(card=null,caster=local){const v=aimVector(caster),dir=aimDirection(caster),range=cardRange(card),pos=caster.pos||local.pos,origin=typeof castOrigin==="function"?castOrigin(caster):{x:pos.x,y:(pos.y||2)+.55,z:pos.z},floorY=typeof arenaFloorY==="function"?arenaFloorY():-0.9;let d=range;if(card?.wave)d=range;else if(v.y<-.03){const groundDist=(floorY-origin.y)/v.y;if(groundDist>1)d=Math.min(range,groundDist)}else d=Math.min(range,isUltimateCard(card)?56:34);const end={x:origin.x+dir.x*d,y:floorY,z:origin.z+dir.z*d};constrainArenaPosition(end);return end}
function pathTargetCandidates({card,element,origin,dir,range,hit,targetId=""}){const r=getRoom();if(!r)return[];const impactRadius=impactHitRadius(card,element),hits=[];Object.entries(r.players).forEach(([id,p])=>{if(id===selfId||!p.alive||p.hp<=0||!p.pos)return;if(r.mode==="team"&&p.team===local.team)return;const point=targetHitPoint(p),body=targetHitboxRadius(p),dx=point.x-origin.x,dz=point.z-origin.z,along=dx*dir.x+dz*dir.z,lateral=Math.abs(dx*dir.z-dz*dir.x),impactDist=Math.hypot(point.x-hit.x,point.z-hit.z),radius=cardHitRadius(card,Math.max(0,along),element)+body,lineHit=along>-body&&along<=range+body&&lateral<=radius,impactHit=impactRadius>0&&impactDist<=impactRadius+body;if(!lineHit&&!impactHit)return;const score=(lineHit?Math.max(0,along):range)+lateral*4+impactDist*(impactHit ? .28 : 0)+(targetId===id?-42:0);hits.push({id,p,d:Math.hypot(point.x-origin.x,point.z-origin.z),along:Math.max(0,along),lateral,impactDist,lineHit,impactHit,hit:point,score})});return hits.sort((a,b)=>a.score-b.score)}
function findTarget(card=null){const id=local.element||"fire",dir=aimDirection(local),origin=typeof castOrigin==="function"?castOrigin(local):local.pos,range=cardRange(card),hit=aimEndpoint(card,local);return pathTargetCandidates({card,element:id,origin,dir,range,hit})[0]||null}
function crowdControlCard(card){return card?.type==="CC기"||!!card?.stun||!!card?.slow||!!card?.pull}
function skillImpactDelay(id,card,dist=0){const speed=skillProjectileSpeed(id,card),cc=crowdControlCard(card),ult=isUltimateCard(card);if(card?.wave)return 1.05;if(card?.firePillar)return .82;if(speed<=0)return cc?clamp((id==="fire" ? .55 : .42)+dist*.004,.42,1.35):.16;let windup=card?.stream ? .1 : .24;if(cc)windup+=id==="lightning" ? .62 : id==="light" ? .52 : id==="fire" ? .55 : id==="earth" ? .55 : .42;if(ult)windup+=id==="wind" ? .82 : id==="lightning" ? .85 : id==="earth" ? .95 : id==="light" ? .9 : id==="poison" ? .82 : .72;if(card?.sun)windup=.72+(card.charge||0)*.42;if(card?.psychicLift)windup+=.35;const worldSpeed=card?.stream?18+speed*4.8:9+speed*3.6,travel=dist/worldSpeed;return clamp(windup+travel,card?.stream ? .18 : .34,card?.stream ? 1.35 : 2.75)}
function targetsOnStoredPath(h){const element=h.element||local.element||"fire";return pathTargetCandidates({card:h.card,element,origin:h.origin,dir:h.dir,range:h.range,hit:h.hit,targetId:h.targetId||""})}
function targetOnStoredPath(h){return targetsOnStoredPath(h)[0]||null}
function queueSkillHit(card,e,target=null){const id=local.element||"fire",dir=aimDirection(local),range=cardRange(card),origin=typeof castOrigin==="function"?castOrigin(local):{x:local.pos.x,y:local.pos.y+.55,z:local.pos.z},hit=aimEndpoint(card,local),dist=Math.hypot(hit.x-origin.x,hit.z-origin.z),delay=skillImpactDelay(id,card,dist),h={id:selfId+"-"+now()+"-"+Math.random().toString(36).slice(2,7),card:{...card},element:id,origin,hit,dir,range,targetId:"",createdAt:now(),impactAt:now()+delay*1000,delay};pendingHits.push(h);if(typeof travelTelegraphEffect==="function")travelTelegraphEffect(h,e);return h}
function resolveSkillHit(h){const e=elements[h.element]||elements.fire,targets=targetsOnStoredPath(h),area=typeof areaTelegraphCard==="function"&&areaTelegraphCard(h.card,h.element),wave=!!h.card?.wave,hitList=wave?targets.filter(t=>t.lineHit):area?targets.filter(t=>t.impactHit):targets.slice(0,1),caster={pos:{x:h.origin.x,y:h.origin.y,z:h.origin.z},rot:{y:Math.atan2(-h.dir.x,-h.dir.z)},element:h.element,fxOrigin:true},impactCard={...h.card,resolvedImpact:true};if(hitList.length){hitList.forEach(t=>hitTarget(t,h.card,e));skillEffect(impactCard,hitList[0],e,caster,wave?h.hit:area?h.hit:hitList[0].hit)}else skillEffect(impactCard,null,e,caster,h.hit)}
function updatePendingHits(t){if(!pendingHits.length)return;const keep=[];pendingHits.forEach(h=>{if(t<h.impactAt)keep.push(h);else resolveSkillHit(h)});pendingHits=keep}
function consumeParryBonus(targetId,card){if(card.type!=="CC기"||now()>(local.parryBonusUntil||0))return 0;if(local.parryTarget&&local.parryTarget!==targetId)return 0;const bonus=local.parryBonusStun||.1;local.parryBonusUntil=0;local.parryBonusStun=0;local.parryTarget="";return bonus}
function randomSkillSlot(){return Math.floor(Math.random()*4)+1}
function applySkillLock(p,card,t){if(card.shortLock&&t>(p.skillLockResistUntil||0)){p.lockedSkillSlot=randomSkillSlot();p.skillLockUntil=t+Math.max(.05,card.shortLock)*1000;p.skillLockResistUntil=t+2000;log("GLITCH LOCK: 스킬 일시 정지")}if(card.roundSeal&&!p.roundSealSlot){p.lockedSkillSlot=randomSkillSlot();p.skillLockUntil=t+170;p.roundSealSlot=p.lockedSkillSlot;p.roundSealSource=selfId;log("SYSTEM FIELD: 스킬 봉인 발생")}}
function applyPositionControl(p,target,card){if(!p.pos||(!card.knock&&!card.pull&&!card.gravity))return;let dx=p.pos.x-local.pos.x,dz=p.pos.z-local.pos.z,d=Math.hypot(dx,dz)||1,force=0;if(card.pull)force=-5.5;else if(card.knock)force=4.5*card.knock;else if(card.gravity)force=-2.5;if(force){p.pos.x+=dx/d*force;p.pos.z+=dz/d*force;constrainArenaPosition(p.pos)}if(card.gravity)p.pos.y=Math.max(p.pos.y||2,3.2)}
function psychicHoldPoint(){const dir=aimDirection(local),dist=8.4,height=clamp(3.6-(local.rot.x||0)*3.2,2.4,6.8);return{x:local.pos.x+dir.x*dist,y:height,z:local.pos.z+dir.z*dist}}
function psychicControlFx(pos,slam=false){if(!scene)return;const e=elements.psychic,card={name:slam?"염동 내려찍기":"염동 포획",type:"궁극기",ultimate:true,psychicControl:true,psychicSlam:slam,damage:slam?10:0,charge:local.psychicLiftCharge||1};skillEffect(card,null,e,local,pos)}
function pushPsychicControlFx(pos,slam=false){const r=getRoom();if(!r)return;const card={name:slam?"염동 내려찍기":"염동 포획",type:"궁극기",ultimate:true,psychicControl:true,psychicSlam:slam,damage:slam?10:0,charge:1};r.fx=[...(r.fx||[]),{id:selfId+"-"+now()+"-"+Math.random().toString(36).slice(2,7),from:selfId,element:"psychic",card,origin:castOrigin(local),hit:{...pos},dir:aimDirection(local),delay:0,rot:{...local.rot},t:now()}].slice(-40);saveRoom(r)}
function startPsychicLiftControl(target,card,e){
  const duration=clamp(card.psychicLiftDuration||.35,.18,1.1),endAt=now()+duration*1000,targetId=target.id,slamDamage=card.psychicLiftSlamDamage||10;
  let nextSlam=now()+260,lastFx=0;
  const timer=setInterval(()=>{
    const r=getRoom(),p=r?.players?.[targetId],t=now();
    if(!r||!p||!p.alive||p.hp<=0||t>endAt){clearInterval(timer);return}
    const hold=psychicHoldPoint(),slam=t>=nextSlam;
    p.pos={x:hold.x,y:slam?2:hold.y,z:hold.z};
    p.stunUntil=Math.max(p.stunUntil||0,t+90);
    p.hitId=(p.hitId||0)+1;
    r.players[targetId]=p;
    saveRoom(r);
    psychicControlFx(p.pos,slam);
    if(t-lastFx>180||slam){pushPsychicControlFx(p.pos,slam);lastFx=t}
    if(slam){
      nextSlam=t+310;
      hitTarget({id:targetId,p,d:Math.hypot((p.pos.x||0)-local.pos.x,(p.pos.z||0)-local.pos.z),hit:targetHitPoint(p)}, {name:"염동 내려찍기",type:"CC기",damage:slamDamage,stun:.1,unparryable:true,psychicSlam:true}, e);
    }
  },55);
}
function hitTarget(target,card,e){
  const r=getRoom();
  if(!r||!r.players[target.id])return;
  const p=r.players[target.id],t=now(),wasAlive=p.alive!==false&&(p.hp||0)>0;
  if((p.parryUntil||0)>t&&(card.damage||0)>0&&!card.unparryable){
    const reflectedCc=crowdControlCard(card);
    p.parryUntil=0;
    if(reflectedCc){p.parryBonusUntil=t+3500;p.parryBonusStun=.1;p.parryTarget=selfId}else{p.parryBonusUntil=0;p.parryBonusStun=0;p.parryTarget=""}
    p.hitId=(p.hitId||0)+1;
    r.players[target.id]=p;saveRoom(r);log(reflectedCc?"상대가 CC기를 패링했습니다.":"상대가 패링했습니다.");return;
  }
  const beforeHp=p.hp||0;
  let raw=Math.round((card.damage||0)*local.power);
  if(card.dragonSlam&&target.d<=(card.executeRadius||0))raw=Math.max(raw,p.maxHp||100);
  if(card.devour&&beforeHp<=((p.maxHp||100)*(card.executeBelow||0)))raw=Math.max(raw,beforeHp);
  let dmg=raw,blocked=0;
  if(p.shield>0&&dmg>0){
    const shieldBreak=card.shieldBreak?Math.round(p.shield*card.shieldBreak):0;
    p.shield=Math.max(0,p.shield-shieldBreak);
    blocked=Math.min(p.shield,dmg);
    p.shield-=blocked;dmg-=blocked;
  }
  const landed=dmg>0||raw<=0,parryBonus=landed?consumeParryBonus(target.id,card):0;
  p.hp-=dmg;
  if(landed){
    if(card.poison)p.hp-=Math.round(card.poison*local.power);
    if(card.burn)p.hp-=Math.round(card.burn*local.power);
    if(card.curse)p.hp-=Math.round(card.curse*local.power);
    if((card.stun||parryBonus)&&!(p.stunUntil>t)){
      const baseStun=card.stun||0,resisted=(p.ccResistUntil||0)>t&&baseStun>0,stunDur=(resisted?baseStun*.5:baseStun)+parryBonus;
      p.stunUntil=t+stunDur*1000;
      p.ccResistUntil=t+2000;
    }
    if(card.slow)p.slowUntil=Math.max(p.slowUntil||0,t+Math.min(card.slow,4)*1000);
    if(card.healCut){p.healCutUntil=t+(card.healCutTime||6)*1000;p.healCutMul=Math.max(card.healCut,.4)}
    applySkillLock(p,card,t);
    applyPositionControl(p,target,card);
    if(card.drain||local.drain){const cap=local.devil||local.oluo||(local.evolve>=5&&local.element==="darkness")?15:12;healLocal(Math.min(cap,Math.round((raw||8)*((card.drain||0)+(local.drain||0)))))}
  }
  const dealt=Math.max(0,beforeHp-Math.max(0,p.hp||0));
  if(dealt>0){local.damageDone=(local.damageDone||0)+dealt;p.damageTaken=(p.damageTaken||0)+dealt;p.dragonRegenBlockedUntil=t+3000}
  if(!landed&&blocked>0)log("상대 방어막이 효과를 막았습니다.");
  if(wasAlive&&p.hp<=0){
    p.hp=0;p.alive=false;p.deaths=(p.deaths||0)+1;
    local.coins+=2;local.totalCoins=(local.totalCoins||0)+2;local.kills=(local.kills||0)+1;
  }else if(p.hp<0)p.hp=0;
  const me=r.players[selfId];
  if(me){me.coins=local.coins;me.totalCoins=local.totalCoins;me.kills=local.kills||0;me.damageDone=local.damageDone||0;me.parryBonusUntil=local.parryBonusUntil||0;me.parryBonusStun=local.parryBonusStun||0;me.parryTarget=local.parryTarget||""}
  p.hitId=(p.hitId||0)+1;
  r.players[target.id]=p;
  saveRoom(r);
  if(landed&&card.psychicLift)startPsychicLiftControl(target,card,e);
}
