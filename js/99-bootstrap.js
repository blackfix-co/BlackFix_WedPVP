// AETHERIS split module: 99-bootstrap.js
$("chatForm").onsubmit=e=>{e.preventDefault();sendChat($("chatInput").value);$("chatInput").value="";closeChat()}
$("continueGame").onclick=closePauseMenu;
$("leaveGame").onclick=leaveGame;
$("endContinue").onclick=endContinue;
$("centerStart").onclick=()=>{$("centerStart").classList.add("hidden");$("roomPanel").classList.remove("hidden")};
$("openJoin").onclick=()=>$("joinForm").classList.toggle("hidden");
$("createRoom").onclick=async()=>{message("menuMessage","방을 만드는 중입니다.");for(let i=0;i<6;i++){const room=makeRoom(code());try{await openHostPeer(room);roomCode=room.code;saveRoom(room);enterLobby(room.code);return}catch(err){if(err?.type!=="unavailable-id")break}}const room=makeRoom(code());roomCode=room.code;networkRole="local";saveRoom(room);enterLobby(room.code);message("lobbyMessage","온라인 연결을 열지 못해 이 브라우저 안에서만 참여할 수 있습니다.")};
$("joinForm").onsubmit=async e=>{e.preventDefault();const v=normalizeRoomCode($("joinCode").value);if(v.length!==6){message("menuMessage","참여 코드 6자리를 입력하세요.");return}const s=readStore(),r=s[v];if(r){if(r.phase!=="lobby"){message("menuMessage","이미 시작된 방입니다.");return}if(Object.keys(r.players).length>=r.maxPlayers&&!r.players[selfId]){message("menuMessage","방이 가득 찼습니다.");return}networkRole="local";hostRoom=r;roomCode=v;r.players[selfId]=r.players[selfId]||playerBase(4,-8);saveRoom(r);enterLobby(v);return}message("menuMessage","온라인 방을 찾는 중입니다.");try{await connectRemoteRoom(v)}catch{clearRoomSession()}};
const inviteCode=normalizeRoomCode(new URLSearchParams(location.search).get("room")||location.hash);if(inviteCode){$("centerStart").classList.add("hidden");$("roomPanel").classList.remove("hidden");$("joinForm").classList.remove("hidden");$("joinCode").value=inviteCode;message("menuMessage","참여 코드가 입력되었습니다. 입장을 누르세요.")}
$("startRoom").onclick=()=>{const r=getRoom();if(!r||r.host!==selfId||Object.keys(r.players).length<2)return;Object.values(r.players).forEach(resetPlayerForLobby);assignTeams(r);r.phase="select";r.deadline=now()+10000;r.endReady={};r.returnLobbyAt=0;Object.values(r.players).forEach(p=>{p.ready=false;p.element=""});saveRoom(r);showSelect()};

addEventListener("beforeunload",()=>{if(leavingRoom)return;persistRoomSession();const r=snapshotLocalPlayer();if(r&&networkRole==="client")sendConn(clientConn,{type:"roomUpdate",playerId:selfId,room:r});if(r&&networkRole!=="client"){const s=readStore();s[r.code]=r;writeStore(s)}try{peer?.destroy?.()}catch{}});
resumeSavedRoom();
