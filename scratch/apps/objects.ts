// html, body {
//   height: 100%;
// }
// body {
//   font: 12px/1.2 Arial;
//   perspective: 600px;
//   perspective: 600px;
//   background: #666;
//   background: linear-gradient(#222,#222,#444);
//   color: #fff;
//   text-align:center;
// }
// .threedee {
//   position: absolute;
//   left: 50%;
//   top: 50%;
//   transform-style: preserve-3d;
//   transform-origin: 50% 50% 50%;
//   backface-visibility: hidden;
// }
// .assembly {
//   animation: spin 4s linear infinite;
// }
// #box-toggle:checked ~ .assembly .face {
//   box-shadow: inset 0 0 0 1px #0f0;
//   mask-image: none !important;
//   backface-visibility: visible;
// }
// @keyframes spin {
//   to {
//     transform: rotateY(360deg) rotateZ(360deg) rotateX(720deg);
//   }
// }

// import PrefixFree from 'prefixfree';

var DRUM_TEXTURE = 'https://keithclark.co.uk/labs/css-fps/drum2.png';

const PrefixFree = (window as any).PrefixFree;

// Assembiles are for grouping faces and other assembiles
function createAssembly() {
  var assembly = document.createElement('div');
  assembly.className = 'threedee assembly';
  return assembly;
}

function createFace(
  w: number,
  h: number,
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
  tSrc: string,
  tx: number,
  ty: number
): HTMLDivElement {
  const args = [w, h, x, y, z, rx, ry, rz, tx, ty];

  const fixed = args.map((val, i) => 
    (typeof val === "number" ? val.toFixed(2) : val)
  );
  const [
    fw, fh, fx, fy, fz,
    frx, fry, frz,
    ftx, fty
  ] = fixed;

  // Calculate margins as fixed once
  const fMarginTop = (-h / 2).toFixed(2);
  const fMarginLeft = (-w / 2).toFixed(2);

  const face = document.createElement('div');
  face.className = 'threedee face';
  face.style.cssText = PrefixFree.prefixCSS(
    `background: url(${tSrc}) -${ftx}px ${fty}px;` +
    `width:${fw}px;` +
    `height:${fh}px;` +
    `margin-top: ${fMarginTop}px;` +
    `margin-left: ${fMarginLeft}px;` +
    `transform: translate3d(${fx}px,${fy}px,${fz}px)` +
    `rotateX(${frx}rad) rotateY(${fry}rad) rotateY(${frz}rad);`
  );
  return face;
}

function createTube(dia, height, sides, texture) {
  var tube = createAssembly();
  var sideAngle = (Math.PI / sides) * 2;
  var sideLen = dia * Math.tan(Math.PI / sides);
  for (var c = 0; c < sides; c++) {
    var x = (Math.sin(sideAngle * c) * dia) / 2;
    var z = (Math.cos(sideAngle * c) * dia) / 2;
    var ry = Math.atan2(x, z);
    tube.appendChild(
      createFace(
        sideLen + 1,
        height,
        x,
        0,
        z,
        0,
        ry,
        0,
        texture,
        sideLen * c,
        0
      )
    );
  }
  return tube;
}

export function createBarrel() {
  var barrel = createTube(100, 196, 20, DRUM_TEXTURE);
  barrel.appendChild(
    createFace(100, 100, 0, -98, 0, Math.PI / 2, 0, 0, DRUM_TEXTURE, 0, 100)
  );
  barrel.appendChild(
    createFace(100, 100, 0, 98, 0, -Math.PI / 2, 0, 0, DRUM_TEXTURE, 0, 100)
  );
  return barrel;
}

document.body.appendChild(createBarrel());