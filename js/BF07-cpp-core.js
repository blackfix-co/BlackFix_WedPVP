const BFCore=(()=>{
const elementIndex={fire:0,water:1,lightning:2,earth:3,wind:4,light:5,darkness:6,poison:7,dragon:8,psychic:9,summoner:10,hacker:11};
const cardTypeIndex=card=>card?.type==="CC기"||card?.stun||card?.slow||card?.pull?2:card?.type==="방어"||card?.shield||card?.heal?1:0;
const cardRange=radius=>radius*2+32;
const aimEndpoint=({pos,rot,origin:givenOrigin,floorY,arenaRadius,moveLimit})=>{
  const range=cardRange(arenaRadius),pitch=Math.max(-1.18,Math.min(1.18,rot?.x||0)),cp=Math.cos(pitch);
  const v={x:-Math.sin(rot?.y||0)*cp,y:Math.sin(pitch),z:-Math.cos(rot?.y||0)*cp},origin=givenOrigin||{x:pos.x,y:(pos.y||2)+.25,z:pos.z};
  let dist=range;
  if(v.y<-.025){const floorDist=(origin.y-floorY)/-v.y;if(floorDist>.01&&floorDist<range)dist=floorDist}
  const end={x:origin.x+v.x*dist,y:floorY,z:origin.z+v.z*dist},d=Math.hypot(origin.x+v.x*dist,origin.z+v.z*dist);
  if(d>moveLimit&&d>.001){end.x=end.x/d*moveLimit;end.z=end.z/d*moveLimit}
  end.distance=Math.hypot(end.x-origin.x,end.z-origin.z);
  return end;
};
const speed=(element,card)=>{
  const id=elementIndex[element]??0,type=cardTypeIndex(card),ult=card?.ultimate||card?.type==="궁극기";
  if(card?.psychicLift)return 6;
  if(card?.wave)return 3.8;
  if(card?.shield||card?.heal||card?.gravity||card?.roundSeal||card?.firePillar)return 0;
  if(card?.sun)return Math.max(3,Math.min(5,5-(card.charge||0)*2));
  if(card?.stream)return id===2||id===5||id===8?10:id===4||id===11?9:id===1||id===7||id===9?8:id===3?6:7;
  if(ult)return id===8?0:id===0?4:id===1?5:id===2?10:id===3?5:id===4?1:id===5?10:id===7||id===10?2:4;
  if(type===2)return id===8||id===0?0:id===2?10:id===3||id===7?5:id===5||id===9?9:id===11?8:6;
  return id===2||id===5?10:id===11||id===4?9:id===1||id===7||id===9?8:id===3?6:7;
};
const impactDelay=(element,card,dist=0)=>{
  const id=elementIndex[element]??0,s=speed(element,card),cc=cardTypeIndex(card)===2,ult=card?.ultimate||card?.type==="궁극기";
  if(card?.stream)return Math.max(.16,Math.min(.42,.16+dist/(90+s*9)));
  if(card?.wave)return Math.max(.65,Math.min(1.45,.65+dist/115));
  if(card?.firePillar)return Math.max(.65,Math.min(1.05,.65+dist/180));
  if(card?.sun)return Math.max(.65,Math.min(1.55,.65+(card.charge||0)*.18+dist/125));
  if(card?.psychicLift)return Math.max(.65,Math.min(1.45,.65+dist/125));
  const area=ult||card?.areaTelegraph||card?.gravity||card?.roundSeal||card?.dragonSlam||card?.devour||card?.spiritGrand,low=area ? .65 : cc ? .42 : .28,high=area?1.65:cc?1.35:1.1,world=s>0?28+s*7:70;
  return Math.max(low,Math.min(high,low+dist/world));
};
const lineHit=args=>{
  const dx=args.targetX-args.originX,dz=args.targetZ-args.originZ,along=dx*args.dirX+dz*args.dirZ,lateral=Math.abs(dx*args.dirZ-dz*args.dirX),impact=Math.hypot(args.targetX-args.hitX,args.targetZ-args.hitZ),body=args.bodyRadius||0;
  return along>-body&&along<=args.range+body&&lateral<=args.radius+body||impact<=args.radius+body;
};
const upgradeDelayMs=readyCount=>readyCount>0?5000:0;
return{elementIndex,cardTypeIndex,cardRange,aimEndpoint,speed,impactDelay,lineHit,upgradeDelayMs};
})();
window.BFCore=BFCore;
