import * as T from 'three';
(()=>{
const host=document.getElementById('scene');
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{host.innerHTML='<p class="webgl-warning">Este navegador no permite mostrar el reloj 3D. El contador sigue funcionando.</p>';return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;host.appendChild(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,100);camera.position.set(.12,.65,8.4);camera.lookAt(0,0,0);
scene.add(new T.HemisphereLight(0xfff4d5,0x8d2478,1.7));
for(const [x,y,z,color,intensity] of [[-3,4,5,0xffffff,3.5],[3,1,-3,0xffe0a0,3],[0,-3,4,0xec7fba,1]]){const l=new T.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);}
const root=new T.Group();root.rotation.y=-.22;scene.add(root);
const red=new T.MeshPhysicalMaterial({color:0xa5092a,metalness:.22,roughness:.22,clearcoat:1,clearcoatRoughness:.16});
const redEdge=new T.MeshStandardMaterial({color:0x700d2b,metalness:.3,roughness:.28});
const textureCanvas=document.createElement('canvas');textureCanvas.width=128;textureCanvas.height=128;const ctx=textureCanvas.getContext('2d');const pixels=ctx.createImageData(128,128);let noise=73;for(let i=0;i<pixels.data.length;i+=4){noise=(noise*1664525+1013904223)>>>0;const n=155+noise%100;pixels.data[i]=n;pixels.data[i+1]=n;pixels.data[i+2]=n;pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);const grainTexture=new T.CanvasTexture(textureCanvas);grainTexture.wrapS=grainTexture.wrapT=T.RepeatWrapping;grainTexture.repeat.set(8,8);const sandMat=new T.MeshStandardMaterial({color:0xe99d0b,roughness:.8,metalness:0,map:grainTexture});
function radius(t){return .063+.646*Math.sin(Math.max(0,Math.min(1,t))*Math.PI/2)**.85;}
const H=1.36,NECK=.09,N=240;
const table=[0];for(let i=1;i<=N;i++){const r1=radius((i-1)/N),r2=radius(i/N);table[i]=table[i-1]+(r1*r1+r2*r2)/2/N;}
const total=table[N];
function level(f){const target=Math.max(0,Math.min(1,f))*total;let i=1;while(i<N&&table[i]<target)i++;return ((i-1)+(target-table[i-1])/(table[i]-table[i-1]))/N;}
function chamberProfile(){const p=[];for(let i=0;i<=80;i++){const t=i/80;p.push(new T.Vector2(radius(t)+.022,NECK+t*H));}return p;}
const full=chamberProfile();const glassProfile=[...full.map(v=>new T.Vector2(v.x,-v.y)).reverse(),...full];
const glass=new T.Mesh(new T.LatheGeometry(glassProfile,72),new T.MeshPhysicalMaterial({color:0xbfe9f2,transparent:true,opacity:.16,roughness:.05,metalness:.1,side:T.DoubleSide,depthWrite:false,clearcoat:1}));glass.renderOrder=3;root.add(glass);
function cylinder(r1,r2,h,y,mat){const mesh=new T.Mesh(new T.CylinderGeometry(r1,r2,h,72,1),mat);mesh.position.y=y;root.add(mesh);return mesh;}
for(const sign of [-1,1]){cylinder(.89,.89,.17,sign*1.62,red);cylinder(.79,.79,.07,sign*1.50,redEdge);cylinder(.82,.82,.045,sign*1.73,red);const ring=new T.Mesh(new T.TorusGeometry(.84,.032,12,72),red);ring.rotation.x=Math.PI/2;ring.position.y=sign*1.69;root.add(ring);}
const top=new T.Mesh(undefined,sandMat),bottom=new T.Mesh(undefined,sandMat);root.add(top,bottom);
const stream=new T.Mesh(new T.CylinderGeometry(.012,.018,1,8),sandMat);root.add(stream);
const points=new Float32Array(55*3);let seed=15;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const seeds=Array.from({length:55},()=>[random(),random(),random()]);
const pointGeo=new T.BufferGeometry();pointGeo.setAttribute('position',new T.BufferAttribute(points,3));const grains=new T.Points(pointGeo,new T.PointsMaterial({color:0xffdb72,size:.022,transparent:true,opacity:.8,depthWrite:false}));root.add(grains);
const curveMaterial=new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.55});
for(const angle of [-.54,2.9]){const p=[];for(let i=5;i<70;i++){const t=i/80;p.push(new T.Vector3((radius(t)+.029)*Math.sin(angle),NECK+t*H,(radius(t)+.029)*Math.cos(angle)));}const line=new T.Line(new T.BufferGeometry().setFromPoints(p),curveMaterial);root.add(line);const lower=line.clone();lower.scale.y=-1;root.add(lower);}
const broadShine=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.16,side:T.DoubleSide,depthWrite:false});
for(const angle of [-.58,2.7]){for(const sign of [-1,1]){const coords=[];for(let i=7;i<=72;i++){const t=i/80;for(const da of [-.055,.055]){const a=angle+da;coords.push((radius(t)+.03)*Math.sin(a),sign*(NECK+t*H),(radius(t)+.03)*Math.cos(a));}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(coords,3));const ids=[];for(let i=0;i<65;i++){const j=i*2;ids.push(j,j+1,j+2,j+1,j+3,j+2);}g.setIndex(ids);const m=new T.Mesh(g,broadShine);m.renderOrder=4;root.add(m);}}
let currentFraction=1,running=false,drawn=-1,flipStart=0,isFlipping=false;
function sandGeometry(f,upper){const p=[];
if(upper){const end=level(f);p.push(new T.Vector2(0,NECK));for(let i=0;i<=55;i++){const t=end*i/55;p.push(new T.Vector2(Math.max(.001,radius(t)-.007),NECK+t*H));}p.push(new T.Vector2(0,NECK+end*H));}
else{const end=level(f);p.push(new T.Vector2(0,-NECK-H));for(let i=55;i>=0;i--){const t=end+(1-end)*i/55;p.push(new T.Vector2(Math.max(.001,radius(t)-.007),-NECK-t*H));}p.push(new T.Vector2(0,-NECK-end*H));}
return new T.LatheGeometry(p,56);}
const sandMeshes=[top,bottom];
for(const mesh of sandMeshes){mesh.geometry=sandGeometry(.5,mesh===top);mesh.geometry.attributes.position.setUsage(T.DynamicDrawUsage);}
function updateSand(){if(Math.abs(currentFraction-drawn)<.00012)return;drawn=currentFraction;
const end=level(currentFraction);
for(const mesh of sandMeshes){const upper=mesh===top,attr=mesh.geometry.attributes.position;const profile=[];
if(upper){profile.push([0,NECK]);for(let i=0;i<=55;i++){const t=end*i/55;profile.push([Math.max(.001,radius(t)-.007),NECK+t*H]);}profile.push([0,NECK+end*H]);}
else{profile.push([0,-NECK-H]);for(let i=55;i>=0;i--){const t=end+(1-end)*i/55;profile.push([Math.max(.001,radius(t)-.007),-NECK-t*H]);}profile.push([0,-NECK-end*H]);}
for(let seg=0;seg<=56;seg++){const a=seg/56*Math.PI*2,si=Math.sin(a),co=Math.cos(a);for(let j=0;j<profile.length;j++){const k=seg*profile.length+j;attr.setXYZ(k,profile[j][0]*si,profile[j][1],profile[j][0]*co);}}
attr.needsUpdate=true;mesh.geometry.computeVertexNormals();}
top.visible=currentFraction>.00001;bottom.visible=currentFraction<.99999;}

window.Arena3D={update(f,active){currentFraction=f;running=active;},flip(){if(matchMedia('(prefers-reduced-motion: reduce)').matches){drawn=-1;return;}isFlipping=true;flipStart=performance.now();},volumeModel:{radius,level,total}};
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(host);resize();
let previous=0,qualityFrames=0,qualityTime=0,renderScale=Math.min(devicePixelRatio,1.5);const samples=[];window.Arena3D.frameStats=()=>({frames:samples.length,renderScale,medianMs:[...samples].sort((a,b)=>a-b)[Math.floor(samples.length/2)]||0,p95Ms:[...samples].sort((a,b)=>a-b)[Math.floor(samples.length*.95)]||0});
function animate(now){requestAnimationFrame(animate);if(document.hidden)return;if(previous){const dt=now-previous;samples.push(dt);qualityTime+=dt;qualityFrames++;if(qualityFrames>=45){const mean=qualityTime/qualityFrames;if(mean>27&&renderScale>.76){renderScale=Math.max(.75,renderScale*.8);renderer.setPixelRatio(renderScale);}qualityTime=0;qualityFrames=0;}}if(samples.length>300)samples.shift();previous=now;
if(isFlipping){const t=Math.min(1,(now-flipStart)/1050);const ease=t*t*(3-2*t);root.rotation.z=-Math.PI*ease;root.position.y=Math.sin(Math.PI*t)*.12;if(t===1){isFlipping=false;root.rotation.z=0;root.position.y=0;drawn=-1;updateSand();}}
else updateSand();
const bottomY=-NECK-level(currentFraction)*H;const length=NECK-bottomY;stream.scale.y=length;stream.position.y=(NECK+bottomY)/2;stream.visible=running&&!isFlipping;grains.visible=stream.visible;
for(let i=0;i<55;i++){const s=seeds[i];const p=((now/750+s[0])%1);points[i*3]=(s[1]-.5)*.042;points[i*3+1]=NECK-p*length;points[i*3+2]=(s[2]-.5)*.042;}pointGeo.attributes.position.needsUpdate=true;
renderer.render(scene,camera);}
requestAnimationFrame(animate);
})();
