// AETHERIS split module: 01-core-state.js
const $=id=>document.getElementById(id);
const storeKey="aetherisRoomV3";
const peerPrefix="aetheris-fps-v3-";
const peerTimeout=9000;
const peerOptions={host:"0.peerjs.com",port:443,path:"/",secure:true,config:{iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"},{urls:"stun:global.stun.twilio.com:3478"}]}};
const selfId=sessionStorage.aetherisSelfId||(sessionStorage.aetherisSelfId=(crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random())));
const names=["아르카","노바","카이","루나","제드","이온","베가","리오"];
const selfName=sessionStorage.aetherisName||(sessionStorage.aetherisName=names[Math.floor(Math.random()*names.length)]+Math.floor(Math.random()*90+10));
const elements={
fire:{name:"불",color:0xff4d37,dash:"화염 돌진",jump:"폭염 점프",cards:[c("화염탄","공격",12,1.1,16,{burn:6}),c("불꽃 장막","방어",24,10,0,{shield:28}),c("폭염 파열","CC기",30,13,18,{knock:.8}),c("태양 투척","궁극기",75,42,55,{burn:10})]},
water:{name:"물",color:0x38a8ff,dash:"물결 활주",jump:"분수 점프",cards:[c("물줄기","공격",8,.9,10,{slow:1.5}),c("치유의 파도","방어",26,11,0,{shield:12,heal:18}),c("심해 속박","CC기",28,14,12,{slow:2}),c("해일 붕괴","궁극기",65,38,42,{slow:2.2,knock:1})]},
lightning:{name:"번개",color:0xffe34a,dash:"전광 대쉬",jump:"뇌전 도약",cards:[c("전격탄","공격",10,.8,13,{}),c("과전류","방어",22,12,0,{speed:3}),c("낙뢰","CC기",34,15,14,{stun:.8}),c("뇌신 강림","궁극기",72,44,46,{stun:.9})]},
earth:{name:"땅",color:0xb87939,dash:"암석 돌진",jump:"지진 점프",cards:[c("암석탄","공격",12,1.2,15,{knock:.35}),c("대지 방패","방어",28,12,0,{shield:40}),c("지면 균열","CC기",30,14,16,{slow:2}),c("산맥 붕괴","궁극기",72,45,50,{shieldBreak:.25})]},
wind:{name:"바람",color:0x35f2cd,dash:"질풍 대쉬",jump:"상승기류 점프",cards:[c("바람 칼날","공격",8,.75,11,{}),c("순풍","방어",22,11,0,{speed:3}),c("회오리 감옥","CC기",28,15,10,{slow:2.2,pull:1}),c("태풍 심판","궁극기",66,40,40,{slow:2.8,pull:1})]},
light:{name:"빛",color:0xfff4a6,dash:"광휘 이동",jump:"천상 도약",cards:[c("광탄","공격",10,.95,13,{}),c("축복 보호막","방어",27,12,0,{shield:24,heal:12}),c("섬광","CC기",30,15,9,{slow:1.6}),c("심판의 광선","궁극기",70,43,48,{shieldBreak:.2})]},
darkness:{name:"어둠",color:0xa66cff,dash:"그림자 이동",jump:"공허 도약",cards:[c("그림자 탄","공격",11,1,12,{drain:.2}),c("그림자 장막","방어",24,12,0,{shield:24}),c("공포의 속삭임","CC기",32,16,10,{stun:.8}),c("블랙홀","궁극기",74,46,44,{drain:.35,slow:2.5,pull:1})]},
poison:{name:"독",color:0x58e35b,dash:"독안개 대쉬",jump:"맹독 점프",cards:[c("독침","공격",10,1,9,{poison:8}),c("독안개","방어",26,13,0,{shield:16,poison:5}),c("마비 독액","CC기",31,15,11,{slow:1.6,poison:6}),c("맹독 폭우","궁극기",68,41,42,{poison:16,slow:2.4})]}
};
Object.values(elements).forEach(e=>Object.assign(e.cards[3],{ultimate:true,healCut:.5,healCutTime:8}));
const elementKeys=Object.keys(elements);
const rewardTable={2:[9,6],3:[9,6,4],4:[9,6,4,3]};
const arenaRadius=64,moveLimit=57,roundEndDelay=3000,dashBaseCooldown=5000;
let roomCode="",scene,camera,renderer,clock,playerBody,floor,opponentMeshes={},nameplates={},selfVisual=null,viewModel=null,effects=[],keys={},mouseLocked=false,gameLoop=0,roomLoop=0,activeBattleRound=0,selectedCard=0,lastSync=0,lastHit=0,lastChatRender="",lastFxSeen={},upgradePicked=false,peer=null,networkRole="local",hostConnections={},hostRoom=null,remoteRoom=null,clientConn=null,reconnectTimer=0,reconnectAttempts=0,leavingRoom=false,local={hp:100,maxHp:100,shield:0,mana:100,maxMana:100,pos:{x:0,y:2,z:8},rot:{x:0,y:0},vel:{x:0,y:0,z:0},dashState:null,dashCdUntil:0,cooldowns:[0,0,0,0],alive:true,element:"",charge:false,chargeMode:"",chargeCard:0,chargeTime:0,chargeTick:0,chargeFxTick:0,parryUntil:0,parryBonusUntil:0,parryBonusStun:0,parryTarget:"",slowUntil:0,stunUntil:0,ccResistUntil:0,speedUntil:0,healCutUntil:0,healCutMul:1,power:1,move:1,cdMul:1,evolve:0,crowns:0,coinBonus:0,drain:0,devil:false,oluo:false,team:0,coins:0,totalCoins:0,spent:0,kills:0,deaths:0,damageDone:0,damageTaken:0,upgradeCounts:{},secondaryElements:[]};
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
  r.players[selfId]={...p,hp:local.hp,maxHp:local.maxHp,shield:local.shield,mana:Math.round(local.mana),maxMana:local.maxMana,pos:{...local.pos},rot:{...local.rot},alive:local.alive,cooldowns:[...(local.cooldowns||[0,0,0,0])],dashCdUntil:local.dashCdUntil||0,stunUntil:local.stunUntil||0,slowUntil:local.slowUntil||0,ccResistUntil:local.ccResistUntil||0,speedUntil:local.speedUntil||0,healCutUntil:local.healCutUntil||0,healCutMul:local.healCutMul||1,parryUntil:local.parryUntil||0,parryBonusUntil:local.parryBonusUntil||0,parryBonusStun:local.parryBonusStun||0,parryTarget:local.parryTarget||"",coins:local.coins,totalCoins:local.totalCoins||0,spent:local.spent||0,kills:local.kills||0,deaths:local.deaths||0,damageDone:local.damageDone||0,damageTaken:local.damageTaken||0,power:local.power,move:local.move,cdMul:local.cdMul,evolve:local.evolve,crowns:local.crowns,coinBonus:local.coinBonus||0,drain:local.drain||0,devil:local.devil,oluo:local.oluo,upgradeCounts:{...(local.upgradeCounts||{})},secondaryElements:[...(local.secondaryElements||[])],lastSeen:now()};
  return r;
}
function makeRoom(c){const maxPlayers=clamp(parseInt($("maxPlayers").value)||2,2,4),maxRounds=clamp(parseInt($("roundCount").value)||8,8,20),mode=$("gameMode").value,room={code:c,host:selfId,maxPlayers,maxRounds,mode,phase:"lobby",round:1,deadline:0,battleFinishAt:0,players:{},logs:[],chat:[],fx:[],endReady:{},returnLobbyAt:0,created:now(),upgradeSeed:0,pendingRound:0};room.players[selfId]=playerBase(-4,8);return room}
function nextSpawn(r){const sp=[[-28,30],[28,-30],[-30,-28],[30,28]];return sp[Object.keys(r.players).length%sp.length]}
function openHostPeer(room){return new Promise((resolve,reject)=>{if(!peerReady()){reject(Error("peer unavailable"));return}closePeer();networkRole="host";hostRoom=room;peer=new Peer(peerRoomId(room.code),peerOptions);let done=false;const fail=err=>{if(done)return;done=true;clearTimeout(timer);closePeer();reject(err)};const timer=setTimeout(()=>fail(Error("timeout")),peerTimeout);peer.on("open",()=>{if(done)return;done=true;clearTimeout(timer);peer.on("connection",handleHostConnection);resolve()});peer.on("disconnected",()=>{try{peer.reconnect()}catch{}});peer.on("error",fail)})}
function handleHostConnection(conn){const pid=conn.metadata?.playerId||conn.peer;hostConnections[pid]=conn;conn.on("open",()=>{const r=getRoom();if(r?.players?.[pid])sendConn(conn,{type:"room",room:r})});conn.on("data",data=>handleHostData(conn,data));conn.on("close",()=>{delete hostConnections[pid]});conn.on("error",()=>{delete hostConnections[pid]})}
function handleHostData(conn,data){const r=getRoom();if(!r||!data)return;const pid=data.playerId||data.player?.id||conn.metadata?.playerId||conn.peer;if(data.type==="leave"){delete r.players[pid];delete hostConnections[pid];saveRoom(r);return}if(data.type==="join"){const returning=!!r.players[pid];if(!returning&&r.phase!=="lobby"){sendConn(conn,{type:"error",message:"이미 시작된 방입니다."});return}if(Object.keys(r.players).length>=r.maxPlayers&&!returning){sendConn(conn,{type:"error",message:"방이 가득 찼습니다."});return}const s=nextSpawn(r),base=data.player||playerBase(s[0],s[1]);r.players[pid]=returning?{...r.players[pid],lastSeen:now()}:{...base,id:pid,name:base.name||conn.metadata?.name||"Player",pos:{x:s[0],y:2,z:s[1]},lastSeen:now()};hostConnections[pid]=conn;saveRoom(r);return}if(data.type==="roomUpdate"){mergeClientRoom(r,data.room,pid);saveRoom(r)}}
function mergeClientRoom(r,incoming,pid){
  if(!incoming?.players?.[pid])return;
  r.players[pid]={...r.players[pid],...incoming.players[pid],lastSeen:now()};
  Object.entries(incoming.players).forEach(([id,p])=>{
    if(id===pid||!r.players[id]||!p)return;
    if((p.hitId||0)>(r.players[id].hitId||0)){
      r.players[id]={...r.players[id],hp:p.hp,shield:p.shield,alive:p.alive,hitId:p.hitId,deaths:p.deaths||0,damageTaken:p.damageTaken||0,stunUntil:p.stunUntil||0,slowUntil:p.slowUntil||0,ccResistUntil:p.ccResistUntil||0,healCutUntil:p.healCutUntil||0,healCutMul:p.healCutMul||1,parryUntil:p.parryUntil||0,parryBonusUntil:p.parryBonusUntil||0,parryBonusStun:p.parryBonusStun||0,parryTarget:p.parryTarget||""};
    }
  });
  if(incoming.chat?.length){const seen=new Set((r.chat||[]).map(m=>m.id));r.chat=[...(r.chat||[]),...incoming.chat.filter(m=>m&&m.id&&!seen.has(m.id))].slice(-24)}
  if(incoming.fx?.length){const seenFx=new Set((r.fx||[]).map(x=>x.id));r.fx=[...(r.fx||[]),...incoming.fx.filter(x=>x&&x.id&&!seenFx.has(x.id))].slice(-40)}
  if(r.phase==="end"||incoming.phase==="end"){r.endReady={...(r.endReady||{}),...(incoming.endReady||{})};if(incoming.returnLobbyAt&&(!r.returnLobbyAt||incoming.returnLobbyAt<r.returnLobbyAt))r.returnLobbyAt=incoming.returnLobbyAt}
  if(r.phase==="upgrade"&&Object.values(r.players).every(p=>p.upgradeReady)&&!r.nextStartAt)r.nextStartAt=now()+3000;
}
function connectRemoteRoom(c){return new Promise((resolve,reject)=>{if(!peerReady()){reject(Error("peer unavailable"));return}clearTimeout(reconnectTimer);closePeer();networkRole="client";persistRoomSession(c,"client");peer=new Peer(undefined,peerOptions);let done=false;const fail=(err,msg)=>{if(done){scheduleReconnect(c);return}done=true;clearTimeout(timer);message("menuMessage",msg||"방을 찾을 수 없습니다. 방장이 같은 사이트를 열어 둔 상태인지 확인하세요.");closePeer();reject(err)};const timer=setTimeout(()=>fail(Error("timeout")),peerTimeout);peer.on("open",()=>{clientConn=peer.connect(peerRoomId(c),{reliable:true,metadata:{playerId:selfId,name:selfName}});clientConn.on("open",()=>sendConn(clientConn,{type:"join",playerId:selfId,player:playerBase(4,-8)}));clientConn.on("data",data=>{if(data?.type==="error"){fail(Error(data.message),data.message);return}if(data?.type==="room"){remoteRoom=data.room;roomCode=data.room.code;persistRoomSession(roomCode,"client");if(!done&&data.room.players[selfId]){done=true;reconnectAttempts=0;clearTimeout(timer);enterLobby(roomCode);resolve()}else if(!$("lobby").classList.contains("hidden")||!$("hud").classList.contains("hidden")||!$("selectScreen").classList.contains("hidden")||!$("upgradeScreen").classList.contains("hidden"))tickRoom()}});clientConn.on("close",()=>{message("lobbyMessage","방장과 연결이 끊겼습니다. 다시 연결 중입니다.");scheduleReconnect(c)});clientConn.on("error",fail)});peer.on("disconnected",()=>{try{peer.reconnect()}catch{scheduleReconnect(c)}});peer.on("error",fail)})}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function now(){return Date.now()}
function roundDurationMs(r){const n=Object.keys(r?.players||{}).length;return n<=2?120000:n===3?150000:180000}
function upgradeCount(p,k){return (p.upgradeCounts&&p.upgradeCounts[k])||0}
function markUpgrade(p,k){if(!k)return;p.upgradeCounts={...(p.upgradeCounts||{})};p.upgradeCounts[k]=(p.upgradeCounts[k]||0)+1}
function finalStatusLabel(p){return p.oluo?"올루오푸스":p.devil?"악마화":(p.evolve||0)>=5?"최종진화":"일반"}
function playerBase(x,z){return{id:selfId,name:selfName,hp:100,maxHp:100,shield:0,mana:100,maxMana:100,pos:{x,y:2,z},rot:{x:0,y:0},alive:true,element:"",ready:false,team:0,coins:0,totalCoins:0,wins:0,kills:0,deaths:0,damageDone:0,damageTaken:0,spent:0,power:1,move:1,cdMul:1,evolve:0,crowns:0,coinBonus:0,drain:0,devil:false,oluo:false,secondaryElements:[],upgradeCounts:{},hitId:0,dashCdUntil:0,stunUntil:0,slowUntil:0,ccResistUntil:0,healCutUntil:0,healCutMul:1,parryUntil:0,parryBonusUntil:0,parryBonusStun:0,parryTarget:"",lastSeen:now(),upgradeReady:false,rank:0}}
function patch(p){
  const r=getRoom();
  if(!r||!r.players[selfId])return;
  const cur=r.players[selfId];
  if((cur.hitId||0)>lastHit){
    const hit={hp:cur.hp,shield:cur.shield,alive:cur.alive,deaths:cur.deaths||0,damageTaken:cur.damageTaken||0,stunUntil:cur.stunUntil||0,slowUntil:cur.slowUntil||0,ccResistUntil:cur.ccResistUntil||0,healCutUntil:cur.healCutUntil||0,healCutMul:cur.healCutMul||1,parryUntil:cur.parryUntil||0,parryBonusUntil:cur.parryBonusUntil||0,parryBonusStun:cur.parryBonusStun||0,parryTarget:cur.parryTarget||""};
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
