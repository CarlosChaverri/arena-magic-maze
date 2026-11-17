const assert=require('node:assert/strict');
const {DURATION,remaining,start,flip,fill}=require('./core.js');
let cases=0;
function test(name,fn){fn();cases++;console.log('OK',name)}
test('Inicio de tres minutos',()=>assert.equal(remaining(start(1000),1000),180000));
test('El tiempo transcurre por reloj, no por intervalos',()=>assert.equal(remaining(start(0),125500),54500));
test('Voltear con 2:20 deja 0:40',()=>assert.equal(remaining(flip(start(0),40000),40000),40000));
test('Voltear con 0:40 deja 2:20',()=>assert.equal(remaining(flip(start(0),140000),140000),140000));
test('Voltear con 1:30 conserva 1:30',()=>assert.equal(remaining(flip(start(0),90000),90000),90000));
test('Doble volteo sin tiempo transcurrido conserva el volumen',()=>{let s=start(0);s=flip(s,40000);s=flip(s,40000);assert.equal(remaining(s,40000),140000)});
test('No se puede resucitar la partida agotada',()=>assert.equal(flip(start(0),180001).mode,'expired'));
test('Agotamiento exacto',()=>assert.equal(remaining(start(0),180000),0));
test('Suspensión prolongada no congela la cuenta',()=>assert.equal(remaining(start(0),900000),0));
test('Cambios de tiempo negativos no producen más de tres minutos',()=>assert.equal(remaining(start(1000),0),180000));
test('La preparación no se voltea',()=>assert.equal(flip({mode:'ready',remaining:DURATION},100).mode,'ready'));
test('Voltear inmediatamente no inventa arena',()=>assert.equal(flip(start(0),0).mode,'expired'));
test('Área proporcional exacta para 1001 fracciones y suma constante',()=>{for(let i=0;i<=1000;i++){let f=i/1000,s=fill(f),k=164/140;let a=16*s.topHeight+k*s.topHeight**2/2,b=180*s.bottomHeight-k*s.bottomHeight**2/2;assert.ok(Math.abs(a/13720-f)<1e-10);assert.ok(Math.abs((a+b)/13720-1)<1e-10)}});
test('Persistir y recuperar conserva el vencimiento',()=>{let s=JSON.parse(JSON.stringify(flip(start(10000),50000)));assert.equal(remaining(s,60000),30000)});
console.log(`${cases} pruebas lógicas superadas`);
