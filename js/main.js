import {mountGame} from './game/sketch.js';

// p5 runtime is vendored from the uploaded GameProjectFinal project. No npm install is needed.
window.addEventListener('DOMContentLoaded',()=>{
  try {mountGame();}
  catch(error){
    console.error('Village initialization failed:',error);
    document.getElementById('game-canvas').innerHTML='<div style="padding:40px;color:#102535">The village could not initialize. Please run the project from a local HTTP server and check the console.</div>';
  }
});
