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
  if(card?.wave)return 1.05;
  if(card?.firePillar)return .82;
  if(s<=0)return cc?Math.max(.42,Math.min(1.35,(id===0 ? .55 : .42)+dist*.004)):.16;
  let wind=card?.stream ? .1 : .24;
  if(cc)wind+=id===2 ? .62 : id===5 ? .52 : id===0||id===3 ? .55 : .42;
  if(ult)wind+=id===4 ? .82 : id===2 ? .85 : id===3 ? .95 : id===5 ? .9 : id===7 ? .82 : .72;
  if(card?.sun)wind=.72+(card.charge||0)*.42;
  if(card?.psychicLift)wind+=.35;
  const world=card?.stream?18+s*4.8:9+s*3.6,low=card?.stream ? .18 : .34,high=card?.stream?1.35:2.75;
  return Math.max(low,Math.min(high,wind+dist/world));
};
const lineHit=args=>{
  const dx=args.targetX-args.originX,dz=args.targetZ-args.originZ,along=dx*args.dirX+dz*args.dirZ,lateral=Math.abs(dx*args.dirZ-dz*args.dirX),impact=Math.hypot(args.targetX-args.hitX,args.targetZ-args.hitZ),body=args.bodyRadius||0;
  return along>-body&&along<=args.range+body&&lateral<=args.radius+body||impact<=args.radius+body;
};
const upgradeDelayMs=readyCount=>readyCount>0?5000:0;
return{elementIndex,cardTypeIndex,cardRange,aimEndpoint,speed,impactDelay,lineHit,upgradeDelayMs};
})();
window.BFCore=BFCore;
