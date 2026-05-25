// StellaCard split module: BF01-core-state.js
const $=id=>document.getElementById(id);
const storeKey="stellaCardRoomV1";
const peerPrefix="stellacard-v1-";
const peerTimeout=9000;
const peerOptions={host:"0.peerjs.com",port:443,path:"/",secure:true,config:{iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"},{urls:"stun:global.stun.twilio.com:3478"}]}};
const selfId=sessionStorage.aetherisSelfId||(sessionStorage.aetherisSelfId=(crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random())));
const names=["아르카","노바","카이","루나","제드","이온","베가","리오"];
const selfName=sessionStorage.aetherisName||(sessionStorage.aetherisName=names[Math.floor(Math.random()*names.length)]+Math.floor(Math.random()*90+10));
const elements={
fire:{name:"불",color:0xff4d37,dash:"화염 돌진",jump:"폭염 점프",cards:[c("화염탄","공격",12,1.1,16,{burn:6}),c("불꽃 장막","방어",24,10,0,{shield:28}),c("폭염 파열","CC기",30,13,18,{knock:.8}),c("태양 투척","궁극기",75,42,55,{burn:10,areaTelegraph:true})]},
water:{name:"물",color:0x38a8ff,dash:"물결 활주",jump:"분수 점프",cards:[c("물줄기","공격",8,.9,10,{slow:1.5}),c("치유의 파도","방어",26,11,0,{shield:12,heal:18}),c("심해 속박","CC기",28,14,12,{slow:2}),c("해일 붕괴","궁극기",65,38,42,{slow:2.2,knock:1})]},
lightning:{name:"번개",color:0xffe34a,dash:"전광 대쉬",jump:"뇌전 도약",cards:[c("전격탄","공격",10,.8,13,{areaTelegraph:true}),c("과전류","방어",22,12,0,{speed:3}),c("낙뢰","CC기",34,15,14,{stun:.12}),c("뇌신 강림","궁극기",72,44,46,{stun:.135})]},
earth:{name:"땅",color:0xb87939,dash:"암석 돌진",jump:"지진 점프",cards:[c("암석탄","공격",12,1.2,15,{knock:.35}),c("대지 방패","방어",28,12,0,{shield:40}),c("지면 균열","CC기",30,14,16,{slow:2}),c("산맥 붕괴","궁극기",72,45,50,{shieldBreak:.25})]},
wind:{name:"바람",color:0x35f2cd,dash:"질풍 대쉬",jump:"상승기류 점프",cards:[c("바람 칼날","공격",8,.75,11,{}),c("순풍","방어",22,11,0,{speed:3}),c("회오리 감옥","CC기",28,15,10,{slow:2.2,pull:1}),c("태풍 심판","궁극기",66,40,40,{slow:2.8,pull:1})]},
light:{name:"빛",color:0xfff4a6,dash:"광휘 이동",jump:"천상 도약",cards:[c("광탄","공격",10,.95,13,{}),c("축복 보호막","방어",27,12,0,{shield:24,heal:12}),c("섬광","CC기",30,15,9,{slow:1.6}),c("심판의 광선","궁극기",70,43,48,{shieldBreak:.2})]},
darkness:{name:"어둠",color:0xa66cff,dash:"그림자 이동",jump:"공허 도약",cards:[c("그림자 탄","공격",11,1,12,{drain:.2}),c("그림자 장막","방어",24,12,0,{shield:24}),c("공포의 속삭임","CC기",32,16,10,{stun:.12}),c("블랙홀","궁극기",74,46,44,{drain:.35,slow:2.5,pull:1})]},
poison:{name:"독",color:0x58e35b,dash:"독안개 대쉬",jump:"맹독 점프",cards:[c("독침","공격",10,1,9,{poison:8}),c("독안개","방어",26,13,0,{shield:16,poison:5}),c("마비 독액","CC기",31,15,11,{slow:1.6,poison:6}),c("맹독 폭우","궁극기",68,41,42,{poison:16,slow:2.4})]},
dragon:{name:"드래곤",color:0xd64224,dash:"용익 돌진",jump:"용의 도약",cards:[c("용염탄","공격",13,1.2,15,{burn:5}),c("비늘 방어","방어",28,13,0,{shield:35,ccReduce:.1}),c("꼬리 강타","CC기",30,14,18,{knock:1,slow:1}),c("천공 강림 내려찍기","궁극기",85,55,48,{dragonSlam:true,executeRadius:6,stun:.18,burn:8,healCut:.45})]},
psychic:{name:"염동력",color:0xbf72ff,dash:"염동 활주",jump:"부양 도약",cards:[c("염동 충격","공격",10,.95,11,{knock:.45}),c("염동 장벽","방어",26,12,0,{shield:30,reflect:.12}),c("강제 이동","CC기",32,15,8,{knock:1.6,slow:.8}),c("중력 역전","궁극기",70,42,38,{slow:2,stun:.16,gravity:true,healCut:.5})]},
summoner:{name:"정령술사",color:0x7be87b,dash:"정령 발걸음",jump:"정령 도약",cards:[c("정령탄","공격",9,.9,10,{spiritShot:true}),c("정령 교대","방어",16,6,0,{spiritSwap:true}),c("정령 결속","CC기",30,14,12,{spiritBind:true,slow:1}),c("정령 대소환","궁극기",72,45,35,{spiritGrand:true,shield:12,heal:10,slow:1.6})]},
hacker:{name:"해커",color:0x23e0a4,dash:"패킷 대쉬",jump:"코드 점프",cards:[c("데이터 탄","공격",8,.8,9,{glitch:.5}),c("방화벽","방어",24,11,0,{shield:24,firewall:1}),c("글리치 락","CC기",30,15,8,{shortLock:.11,slow:.6}),c("시스템 영역 전개","궁극기",75,48,32,{roundSeal:true,stun:.17,healCut:.5})]}
};
Object.values(elements).forEach(e=>Object.assign(e.cards[3],{ultimate:true,healCut:.5,healCutTime:8}));
const elementKeys=Object.keys(elements);
const rewardTable={2:[14,12],3:[14,12,10],4:[14,12,10,8]};
const arenaRadius=64,moveLimit=57,roundEndDelay=3000,dashBaseCooldown=500;
let roomCode="",scene,camera,renderer,clock,playerBody,floor,opponentMeshes={},nameplates={},selfVisual=null,viewModel=null,effects=[],pendingHits=[],keys={},mouseLocked=false,gameLoop=0,roomLoop=0,activeBattleRound=0,selectedCard=0,lastSync=0,lastHit=0,lastChatRender="",lastFxSeen={},lastCardRender=0,upgradePicked=false,peer=null,networkRole="local",hostConnections={},hostRoom=null,remoteRoom=null,clientConn=null,reconnectTimer=0,reconnectAttempts=0,leavingRoom=false,local={hp:100,maxHp:100,shield:0,mana:100,maxMana:100,pos:{x:0,y:2,z:8},rot:{x:0,y:0},vel:{x:0,y:0,z:0},dashState:null,dashCdUntil:0,dragonQCdUntil:0,cooldowns:[0,0,0,0],alive:true,element:"",gameId:"",battleStateId:"",spectatorMode:"free",spectatorTarget:"",spectatorPos:null,spectatorInit:false,rangePreviewAt:0,charge:false,chargeMode:"",chargeCard:0,chargeTime:0,chargeTick:0,chargeFxTick:0,psychicLiftCharge:0,psychicLiftReadyUntil:0,parryUntil:0,parryBonusUntil:0,parryBonusStun:0,parryTarget:"",slowUntil:0,stunUntil:0,ccResistUntil:0,speedUntil:0,healCutUntil:0,healCutMul:1,skillLockUntil:0,lockedSkillSlot:0,skillLockResistUntil:0,roundSealSlot:0,roundSealSource:"",dragonRegenBlockedUntil:0,power:1,move:1,moveBase:1,cdMul:1,evolve:0,crowns:0,coinBonus:0,drain:0,devil:false,oluo:false,dragonParts:{},dragonComplete:false,spirit:"fire",team:0,coins:0,totalCoins:0,spent:0,kills:0,deaths:0,damageDone:0,damageTaken:0,upgradeCounts:{},secondaryElements:[]};
function c(name,type,mana,cd,damage,extra){return{name,type,mana,cd,damage,...extra}}
function readStore(){try{return JSON.parse(localStorage.getItem(storeKey))||{}}catch{return{}}}
function writeStore(s){localStorage.setItem(storeKey,JSON.stringify(s))}
function getRoom(){if(networkRole==="client")return remoteRoom;const r=readStore()[roomCode];if(r)hostRoom=r;return hostRoom}
function saveRoom(r){if(!r)return;persistRoomSession(r.code,networkRole);if(networkRole==="client"){remoteRoom=r;sendConn(clientConn,{type:"roomUpdate",playerId:selfId,room:r});return}hostRoom=r;const s=readStore();s[r.code]=r;writeStore(s);if(networkRole==="host")broadcastRoom(r)}
function code(){const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";return Array.from({length:6},()=>a[Math.floor(Math.random()*a.length)]).join("")}
function normalizeRoomCode(v){const compact=String(v||"").toUpperCase().replace(/[^A-Z0-9]/g,"");return compact.length>6?compact.slice(-6):compact}
function peerRoomId(c){return peerPrefix+c.toLowerCase()}
function peerReady(){return typeof Peer!=="undefined"}
function sendConn(conn,data){try{if(conn&&conn.open)conn.send(data)}catch{}}
function broadcastRoom(r){remoteRoom=r;Object.values(hostConnections).forEach(conn=>sendConn(conn,{type:"room",room:r}))}
function closePeer(){try{clientConn?.close?.()}catch{};try{peer?.destroy?.()}catch{};peer=null;clientConn=null;hostConnections={};remoteRoom=null;hostRoom=null;networkRole="local"}
function persistRoomSession(c=roomCode,role=networkRole){if(!c)return;sessionStorage.aetherisRoomCode=c;sessionStorage.aetherisRoomRole=role}
function clearRoomSession(){sessionStorage.removeItem("aetherisRoomCode");sessionStorage.removeItem("aetherisRoomRole");clearTimeout(reconnectTimer);reconnectTimer=0;reconnectAttempts=0}
function scheduleReconnect(c=roomCode){if(leavingRoom||!c||sessionStorage.aetherisRoomRole!=="client")return;clearTimeout(reconnectTimer);const delay=Math.min(6500,900+reconnectAttempts*900);reconnectAttempts++;reconnectTimer=setTimeout(()=>connectRemoteRoom(c).then(()=>{reconnectAttempts=0;tickRoom()}).catch(()=>scheduleReconnect(c)),delay)}
function snapshotLocalPlayer(){
  const r=getRoom(),p=r?.players?.[selfId];
  if(!r||!p)return null;
  r.players[selfId]={...p,hp:local.hp,maxHp:local.maxHp,shield:local.shield,mana:Math.round(local.mana),maxMana:local.maxMana,pos:{...local.pos},rot:{...local.rot},alive:local.alive,gameId:local.gameId||r.gameId||p.gameId||"",battleStateId:local.battleStateId||r.battleStateId||p.battleStateId||"",cooldowns:[...(local.cooldowns||[0,0,0,0])],dashCdUntil:local.dashCdUntil||0,dragonQCdUntil:local.dragonQCdUntil||0,stunUntil:local.stunUntil||0,slowUntil:local.slowUntil||0,ccResistUntil:local.ccResistUntil||0,speedUntil:local.speedUntil||0,healCutUntil:local.healCutUntil||0,healCutMul:local.healCutMul||1,skillLockUntil:local.skillLockUntil||0,lockedSkillSlot:local.lockedSkillSlot||0,skillLockResistUntil:local.skillLockResistUntil||0,roundSealSlot:local.roundSealSlot||0,roundSealSource:local.roundSealSource||"",dragonRegenBlockedUntil:local.dragonRegenBlockedUntil||0,parryUntil:local.parryUntil||0,parryBonusUntil:local.parryBonusUntil||0,parryBonusStun:local.parryBonusStun||0,parryTarget:local.parryTarget||"",coins:local.coins,totalCoins:local.totalCoins||0,spent:local.spent||0,kills:local.kills||0,deaths:local.deaths||0,damageDone:local.damageDone||0,damageTaken:local.damageTaken||0,power:local.power,move:local.move,moveBase:local.moveBase||1,cdMul:local.cdMul,evolve:local.evolve,crowns:local.crowns,coinBonus:local.coinBonus||0,drain:local.drain||0,devil:local.devil,oluo:local.oluo,dragonParts:{...(local.dragonParts||{})},dragonComplete:!!local.dragonComplete,spirit:local.spirit||"fire",upgradeCounts:{...(local.upgradeCounts||{})},secondaryElements:[...(local.secondaryElements||[])],lastSeen:now()};
  return r;
}
function makeGameId(){return selfId+"-"+now()+"-"+Math.random().toString(36).slice(2,7)}
function makeRoom(c){const maxPlayers=clamp(parseInt($("maxPlayers").value)||2,2,4),maxRounds=clamp(parseInt($("roundCount").value)||8,8,20),mode=$("gameMode").value,room={code:c,host:selfId,maxPlayers,maxRounds,mode,phase:"lobby",round:1,deadline:0,battleFinishAt:0,players:{},logs:[],chat:[],fx:[],endReady:{},returnLobbyAt:0,created:now(),gameId:makeGameId(),battleStateId:"",upgradeSeed:0,pendingRound:0,finalStats:null};room.players[selfId]=playerBase(-4,8);room.players[selfId].gameId=room.gameId;return room}
function nextSpawn(r){const sp=[[-28,30],[28,-30],[-30,-28],[30,28]];return sp[Object.keys(r.players).length%sp.length]}
function openHostPeer(room){return new Promise((resolve,reject)=>{if(!peerReady()){reject(Error("peer unavailable"));return}closePeer();networkRole="host";hostRoom=room;peer=new Peer(peerRoomId(room.code),peerOptions);let done=false;const fail=err=>{if(done)return;done=true;clearTimeout(timer);closePeer();reject(err)};const timer=setTimeout(()=>fail(Error("timeout")),peerTimeout);peer.on("open",()=>{if(done)return;done=true;clearTimeout(timer);peer.on("connection",handleHostConnection);resolve()});peer.on("disconnected",()=>{try{peer.reconnect()}catch{}});peer.on("error",fail)})}
function handleHostConnection(conn){const pid=conn.metadata?.playerId||conn.peer;hostConnections[pid]=conn;conn.on("open",()=>{const r=getRoom();if(r?.players?.[pid])sendConn(conn,{type:"room",room:r})});conn.on("data",data=>handleHostData(conn,data));conn.on("close",()=>{delete hostConnections[pid]});conn.on("error",()=>{delete hostConnections[pid]})}
function handleHostData(conn,data){const r=getRoom();if(!r||!data)return;const pid=data.playerId||data.player?.id||conn.metadata?.playerId||conn.peer;if(data.type==="leave"){delete r.players[pid];delete hostConnections[pid];saveRoom(r);return}if(data.type==="join"){const returning=!!r.players[pid];if(!returning&&r.phase!=="lobby"){sendConn(conn,{type:"error",message:"이미 시작된 방입니다."});return}if(Object.keys(r.players).length>=r.maxPlayers&&!returning){sendConn(conn,{type:"error",message:"방이 가득 찼습니다."});return}const s=nextSpawn(r),base=data.player||playerBase(s[0],s[1]);r.players[pid]=returning?{...r.players[pid],lastSeen:now()}:{...base,id:pid,name:base.name||conn.metadata?.name||"Player",pos:{x:s[0],y:2,z:s[1]},lastSeen:now()};hostConnections[pid]=conn;saveRoom(r);return}if(data.type==="roomUpdate"){mergeClientRoom(r,data.room,pid);saveRoom(r)}}
function mergeClientRoom(r,incoming,pid){
  if(!incoming?.players?.[pid])return;
  const stale=staleClientUpdate(r,incoming,pid);
  if(stale){
    r.players[pid]={...r.players[pid],name:incoming.players[pid].name||r.players[pid]?.name,lastSeen:now()};
  }else{
    const keepTeam=r.phase!=="lobby"?r.players[pid]?.team:incoming.players[pid].team;
    r.players[pid]={...r.players[pid],...incoming.players[pid],team:keepTeam,lastSeen:now()};
  }
  if(stale)return;
  Object.entries(incoming.players).forEach(([id,p])=>{
    if(id===pid||!r.players[id]||!p)return;
    if((p.hitId||0)>(r.players[id].hitId||0)){
      r.players[id]={...r.players[id],hp:p.hp,shield:p.shield,alive:p.alive,pos:p.pos?{...p.pos}:r.players[id].pos,hitId:p.hitId,deaths:p.deaths||0,damageTaken:p.damageTaken||0,stunUntil:p.stunUntil||0,slowUntil:p.slowUntil||0,ccResistUntil:p.ccResistUntil||0,healCutUntil:p.healCutUntil||0,healCutMul:p.healCutMul||1,skillLockUntil:p.skillLockUntil||0,lockedSkillSlot:p.lockedSkillSlot||0,skillLockResistUntil:p.skillLockResistUntil||0,roundSealSlot:p.roundSealSlot||0,roundSealSource:p.roundSealSource||"",dragonRegenBlockedUntil:p.dragonRegenBlockedUntil||0,parryUntil:p.parryUntil||0,parryBonusUntil:p.parryBonusUntil||0,parryBonusStun:p.parryBonusStun||0,parryTarget:p.parryTarget||""};
    }
  });
  if(incoming.chat?.length){const seen=new Set((r.chat||[]).map(m=>m.id));r.chat=[...(r.chat||[]),...incoming.chat.filter(m=>m&&m.id&&!seen.has(m.id))].slice(-24)}
  if(incoming.fx?.length){const seenFx=new Set((r.fx||[]).map(x=>x.id));r.fx=[...(r.fx||[]),...incoming.fx.filter(x=>x&&x.id&&!seenFx.has(x.id))].slice(-40)}
  if(r.phase==="end"||incoming.phase==="end"){r.endReady={...(r.endReady||{}),...(incoming.endReady||{})};if(incoming.returnLobbyAt&&(!r.returnLobbyAt||incoming.returnLobbyAt<r.returnLobbyAt))r.returnLobbyAt=incoming.returnLobbyAt}
  if(r.phase==="upgrade"&&Object.values(r.players).every(p=>p.upgradeReady)&&!r.nextStartAt)r.nextStartAt=now()+3000;
}
function staleClientUpdate(r,incoming,pid){
  const p=incoming?.players?.[pid]||{};
  const roomGame=r.gameId||"",incomingGame=incoming.gameId||p.gameId||"";
  if(roomGame&&incomingGame&&roomGame!==incomingGame)return true;
  if(r.phase==="lobby"&&incoming.phase&&incoming.phase!=="lobby")return true;
  if(r.phase==="battle"){
    if(incoming.phase&&incoming.phase!=="battle")return true;
    if(Number(incoming.round||0)!==Number(r.round||0))return true;
    const battle=r.battleStateId||"",incomingBattle=incoming.battleStateId||p.battleStateId||"";
    if(battle&&incomingBattle&&battle!==incomingBattle)return true;
  }
  return false;
}
function connectRemoteRoom(c){return new Promise((resolve,reject)=>{if(!peerReady()){reject(Error("peer unavailable"));return}clearTimeout(reconnectTimer);closePeer();networkRole="client";persistRoomSession(c,"client");peer=new Peer(undefined,peerOptions);let done=false;const fail=(err,msg)=>{if(done){scheduleReconnect(c);return}done=true;clearTimeout(timer);message("menuMessage",msg||"방을 찾을 수 없습니다. 방장이 같은 사이트를 열어 둔 상태인지 확인하세요.");closePeer();reject(err)};const timer=setTimeout(()=>fail(Error("timeout")),peerTimeout);peer.on("open",()=>{clientConn=peer.connect(peerRoomId(c),{reliable:true,metadata:{playerId:selfId,name:selfName}});clientConn.on("open",()=>sendConn(clientConn,{type:"join",playerId:selfId,player:playerBase(4,-8)}));clientConn.on("data",data=>{if(data?.type==="error"){fail(Error(data.message),data.message);return}if(data?.type==="room"){remoteRoom=data.room;roomCode=data.room.code;persistRoomSession(roomCode,"client");if(!done&&data.room.players[selfId]){done=true;reconnectAttempts=0;clearTimeout(timer);enterLobby(roomCode);resolve()}else if(!$("lobby").classList.contains("hidden")||!$("hud").classList.contains("hidden")||!$("selectScreen").classList.contains("hidden")||!$("upgradeScreen").classList.contains("hidden"))tickRoom()}});clientConn.on("close",()=>{message("lobbyMessage","방장과 연결이 끊겼습니다. 다시 연결 중입니다.");scheduleReconnect(c)});clientConn.on("error",fail)});peer.on("disconnected",()=>{try{peer.reconnect()}catch{scheduleReconnect(c)}});peer.on("error",fail)})}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function now(){return Date.now()}
function roundDurationMs(r){const n=Object.keys(r?.players||{}).length;return n<=2?120000:n===3?150000:180000}
function upgradeCount(p,k){return (p.upgradeCounts&&p.upgradeCounts[k])||0}
function markUpgrade(p,k){if(!k)return;p.upgradeCounts={...(p.upgradeCounts||{})};p.upgradeCounts[k]=(p.upgradeCounts[k]||0)+1}
function finalStatusLabel(p){return p.oluo?"올루오푸스":p.devil?"악마화":(p.evolve||0)>=5?"최종진화":"일반"}
function hasElement(p,id){return p?.element===id||(p?.secondaryElements||[]).includes(id)}
function elementBaseStats(id){return id==="dragon"?{maxHp:110,maxMana:100,moveBase:.97}:id==="psychic"?{maxHp:100,maxMana:110,moveBase:1}:id==="summoner"?{maxHp:95,maxMana:115,moveBase:1}:id==="hacker"?{maxHp:90,maxMana:110,moveBase:1.03}:{maxHp:100,maxMana:100,moveBase:1}}
function applyElementBase(p,id){const base=elementBaseStats(id);p.element=id;p.maxHp=Math.max(p.maxHp||100,base.maxHp);p.hp=p.maxHp;p.maxMana=Math.max(p.maxMana||100,base.maxMana);p.mana=p.maxMana;p.moveBase=base.moveBase;p.spirit=p.spirit||"fire";return p}
function playerBase(x,z){return{id:selfId,name:selfName,hp:100,maxHp:100,shield:0,mana:100,maxMana:100,pos:{x,y:2,z},rot:{x:0,y:0},alive:true,element:"",gameId:"",battleStateId:"",ready:false,team:0,coins:0,totalCoins:0,wins:0,kills:0,deaths:0,damageDone:0,damageTaken:0,spent:0,power:1,move:1,moveBase:1,cdMul:1,evolve:0,crowns:0,coinBonus:0,drain:0,devil:false,oluo:false,dragonParts:{},dragonComplete:false,spirit:"fire",secondaryElements:[],upgradeCounts:{},hitId:0,dashCdUntil:0,dragonQCdUntil:0,stunUntil:0,slowUntil:0,ccResistUntil:0,healCutUntil:0,healCutMul:1,skillLockUntil:0,lockedSkillSlot:0,skillLockResistUntil:0,roundSealSlot:0,roundSealSource:"",dragonRegenBlockedUntil:0,parryUntil:0,parryBonusUntil:0,parryBonusStun:0,parryTarget:"",lastSeen:now(),upgradeReady:false,rank:0}}
function patch(p){
  const r=getRoom();
  if(!r||!r.players[selfId])return;
  const cur=r.players[selfId];
  if((cur.hitId||0)>lastHit){
    const hit={hp:cur.hp,shield:cur.shield,alive:cur.alive,pos:cur.pos?{...cur.pos}:local.pos,deaths:cur.deaths||0,damageTaken:cur.damageTaken||0,stunUntil:cur.stunUntil||0,slowUntil:cur.slowUntil||0,ccResistUntil:cur.ccResistUntil||0,healCutUntil:cur.healCutUntil||0,healCutMul:cur.healCutMul||1,skillLockUntil:cur.skillLockUntil||0,lockedSkillSlot:cur.lockedSkillSlot||0,skillLockResistUntil:cur.skillLockResistUntil||0,roundSealSlot:cur.roundSealSlot||0,roundSealSource:cur.roundSealSource||"",dragonRegenBlockedUntil:cur.dragonRegenBlockedUntil||0,parryUntil:cur.parryUntil||0,parryBonusUntil:cur.parryBonusUntil||0,parryBonusStun:cur.parryBonusStun||0,parryTarget:cur.parryTarget||""};
    Object.assign(local,hit);
    p={...p,...hit};
  }
  r.players[selfId]={...cur,...p,lastSeen:now()};
  saveRoom(r);
}
function patchLocal(p){Object.assign(local,p);patch(p)}
function lockPointer(){try{const p=document.body.requestPointerLock?.();p?.catch?.(()=>{})}catch{}}
function unlockPointer(){try{const p=document.exitPointerLock?.();p?.catch?.(()=>{})}catch{}}
function showOnly(id){["menu","lobby","selectScreen","upgradeScreen","hud","endScreen"].forEach(x=>$(x).classList.toggle("hidden",x!==id));$("roomCode").classList.add("hidden");if(id!=="hud"){keys={};clearChargeSkill();$("pauseMenu").classList.add("hidden");unlockPointer()}}
function showLobbyCode(c){const el=$("roomCode");el.textContent="참여 코드 "+c;el.classList.remove("hidden")}
function message(id,text){$(id).textContent=text}
function log(text){const el=document.createElement("div");el.textContent="> "+text;$("log").appendChild(el);while($("log").children.length>8)$("log").firstChild.remove()}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
function sendChat(text){const msg=text.trim().slice(0,60),r=getRoom();if(!msg||!r)return;r.chat=[...(r.chat||[]),{id:selfId+"-"+now()+"-"+Math.random().toString(36).slice(2,7),name:selfName,text:msg,t:now()}].slice(-24);saveRoom(r);renderChat(r)}
function renderChat(r){const box=$("chatMessages");if(!box)return;const chat=(r?.chat||[]).slice(-8),sig=chat.map(m=>m.id).join("|");if(sig===lastChatRender)return;lastChatRender=sig;box.innerHTML=chat.map(m=>`<div class="chat-line"><b>${esc(m.name)}</b> ${esc(m.text)}</div>`).join("")}
function openChat(){const form=$("chatForm"),input=$("chatInput");form.classList.add("open");unlockPointer();setTimeout(()=>input.focus(),0)}
function closeChat(){const form=$("chatForm"),input=$("chatInput");form.classList.remove("open");input.blur();if(!$("hud").classList.contains("hidden")&&!isPauseOpen())lockPointer()}
function isPauseOpen(){return !$("pauseMenu").classList.contains("hidden")}
function openPauseMenu(){if($("hud").classList.contains("hidden"))return;keys={};clearChargeSkill();$("pauseMenu").classList.remove("hidden");closeChat();unlockPointer()}
function closePauseMenu(){$("pauseMenu").classList.add("hidden");if(!$("hud").classList.contains("hidden"))lockPointer()}
function leaveGame(){leavingRoom=true;const r=getRoom();if(r?.players?.[selfId]){if(networkRole==="client"){sendConn(clientConn,{type:"leave",playerId:selfId})}else{if(r.host===selfId){r.players[selfId].alive=false;r.players[selfId].hp=0;r.phase="end";r.deadline=now()}else delete r.players[selfId];saveRoom(r)}}clearRoomSession();closePeer();location.replace(location.origin+location.pathname)}
