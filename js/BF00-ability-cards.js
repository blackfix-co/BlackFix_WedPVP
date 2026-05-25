function c(name,type,mana,cd,damage,extra){return{name,type,mana,cd,damage,...extra}}
const elements={
fire:{name:"불",color:0xff4d37,dash:"화염 돌진",jump:"폭염 점프",cards:[c("화염탄","공격",12,1.1,16,{burn:6,fireCharge:true}),c("불꽃 장막","방어",24,10,0,{shield:28,fireGuard:true}),c("폭염 파열","CC기",30,13,18,{knock:.8,areaTelegraph:true,firePillar:true}),c("태양 투척","궁극기",75,42,55,{burn:10,areaTelegraph:true})]},
water:{name:"물",color:0x38a8ff,dash:"물결 활주",jump:"분수 점프",cards:[c("물줄기","공격",8,.9,10,{slow:1.5,waterBeam:true}),c("치유의 파도","방어",26,11,0,{shield:12,heal:18,waterGuard:true}),c("심해 구속구","CC기",28,14,12,{slow:2,stun:.1,waterBubble:true}),c("해일 진격","궁극기",72,42,58,{slow:2.2,knock:1,stun:.14,wave:true,areaTelegraph:true})]},
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


