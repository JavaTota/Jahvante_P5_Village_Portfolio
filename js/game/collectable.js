// Original Collectable model adapted to a village: little learnable technology tokens.
export const initialCollectables = [
  {x:22,y:21,label:'React'},{x:41,y:21,label:'Python'},
  {x:32,y:28,label:'APIs'},{x:20,y:35,label:'Teamwork'},{x:39,y:35,label:'TypeScript'},
].map((item,i)=>({...item,id:i,found:false}));
export function drawCollectables(p,items,tile,time){
  items.forEach(item=>{
    if(item.found)return;
    const x=item.x*tile+tile/2,y=item.y*tile+tile/2+Math.sin(time*.003+item.id)*2;
    p.noStroke();p.fill('#2b6756');p.rect(x-7,y-7,14,14);
    p.fill('#ffe27b');p.rect(x-5,y-5,10,10);p.fill('#fff5b4');p.rect(x-2,y-2,4,4);
  });
}
export function collectOnTouch(player,items,tile){
  const hit=items.find(item=>!item.found&&Math.hypot(player.x-(item.x*tile+tile/2),player.y-(item.y*tile+tile/2))<18);
  if(hit)hit.found=true;
  return hit||null;
}
