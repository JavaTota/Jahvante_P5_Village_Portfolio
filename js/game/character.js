// The visitor is a top-down, small-scale version of the green alien and purple outfit
// drawn in the original GameProjectFinal/other/character.js.
export function drawAlienCharacter(p,player) {
  p.push();p.translate(Math.round(player.x),Math.round(player.y));
  const bob=player.walking?Math.round(Math.sin(player.frame*.42)*2):0;
  p.noStroke();
  p.fill(40,90,62,80);p.ellipse(0,3,28,10); // shadow, at the character's feet
  p.translate(0,bob);
  p.fill('#172c36');p.rect(-8,-5,7,6);p.rect(2,-5,7,6); // boots
  p.fill('#6d4b9d');p.rect(-10,-24,20,22); // purple suit
  p.fill('#f6c95b');p.rect(-10,-8,20,4); // signature gold belt
  p.fill('#644088');p.rect(-15,-21,5,11);p.rect(10,-21,5,11); // sleeves
  p.fill('#a5dc73');p.rect(-15,-11,5,4);p.rect(10,-11,5,4); // hands
  p.fill('#264d3c');p.rect(-13,-42,26,21); // head outline
  p.fill('#8ad271');p.rect(-11,-40,22,18); // bright green alien
  p.fill('#8ad271');p.rect(-7,-48,4,8);p.rect(4,-48,4,8); // antennae
  p.fill('#ac80d9');p.rect(-8,-50,6,4);p.rect(3,-50,6,4);
  if(player.face==='up'){
    p.fill('#609e61');p.rect(-6,-38,12,3);
  } else {
    p.fill('#193237');
    if(player.face==='left'){p.rect(-7,-34,5,6);}else if(player.face==='right'){p.rect(2,-34,5,6);}else{p.rect(-7,-34,5,6);p.rect(2,-34,5,6);}
    p.fill('#f4fbda');
    if(player.face==='down'){p.rect(-6,-34,2,2);p.rect(3,-34,2,2);}
    p.fill('#426947');p.rect(-3,-26,6,2);
  }
  p.pop();
}
