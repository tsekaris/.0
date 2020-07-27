async function main() {
  function windowOnload() {
    return new Promise(function (resolve, reject) {
      window.onload = resolve;
    });
  }
  try {
    await windowOnload();
    let file = await fetch('svg/main.svg');
    let text = await file.text();
    document.body.insertAdjacentHTML('afterbegin', text);
    window.mpcb = SVG('#text');
  } catch (error) {
    console.log(error);
  }
}

main();
