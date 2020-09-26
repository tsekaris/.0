function cpus() {
  const xys = [
    { x: 6, y: 4 },
    { x: 8, y: 6 },
    { x: 12, y: 8 },
    { x: 14, y: 10 },
    { x: 20, y: 12 },
    { x: 24, y: 16 },
    { x: 36, y: 24 },
  ];
  const types = ['MA', 'MC']; // MA: eco
  const ys = ['J', 'R']; // j: transistor pnp, r: relay
  const pss = ['AC', 'D24']; // D24 Δεν τα φέρνει γιατί τα ac μπορουν να δεχτούν ανεπίσημα 24 dc. Στο μέλλον θα φαίρνει μόνο dc.

  const items = [];
  // const codesIntech = [];
  xys.forEach((xy) => {
    types.forEach((type) => {
      ys.forEach((y) => {
        pss.forEach((ps) => {
          const item = {
            code: `FBs-${xy.x + xy.y}${type}${y}2-${ps}`,
            rs232: 1,
            di: xy.x,
          };
          if (ps === 'AC') {
            item.ps = ['230vac', '24vdc'];
          } else if (ps === 'D24') {
            item.ps = '24vdc';
          }
          if (y === 'rly') {
            item.rly = xy.y;
          } else {
            item.do = xy.y;
          }
          items.push(item); // Το 2 είναι rs232. Με usb δεν φέρνει.
          // codesIntech.push(`FBs-${xy.x + xy.y}${type}(J,R)2 ${ps}`);
        });
      });
    });
  });

  console.log(items);
  console.log(items.length);
  // console.log(codesIntech);
}

cpus();
