import THREE from "three";
import RetroBomber from "lib/RetroBomber";

// main
console.log("start! THREE.REVISON: " +THREE.REVISION);
let retroBomber = new RetroBomber();
// add load event
window.addEventListener("load", retroBomber.init());
