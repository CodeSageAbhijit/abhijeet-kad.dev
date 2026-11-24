// A depth-tested ember with individually shaded hot faces and twisting flame shells.
import {
  WebGLRenderer, PerspectiveCamera, Scene, Group, Mesh, IcosahedronGeometry,
  ShaderMaterial, SphereGeometry, MeshBasicMaterial, Color, Float32BufferAttribute,
  AdditiveBlending, DoubleSide,
} from "three";

const plumeVertex = `
uniform float clock, phase, height, width, twist;
varying vec2 st;
varying float depth;
void main(){
  st = uv;
  float h = uv.y;
  float a = uv.x * 6.283185 + phase;
  float r = sin(pow(h,.68)*3.14159)*width*pow(1.-h,.62);
  r *= 1.+.12*sin(3.*a-7.*h+clock);
  float curl = phase + h*twist - clock*.85;
  vec3 p = vec3(cos(a)*r, h*height-.51, sin(a)*r);
  p.xz += vec2(cos(curl),sin(curl))*(.05+.36*h);
  p.x += .14*h*h*sin(clock*1.4+phase);
  vec4 v = modelViewMatrix*vec4(p,1.);
  depth = (modelViewMatrix*vec4(p,0.)).z;
  gl_Position=projectionMatrix*v;
}`;
const plumeFragment = `
varying vec2 st;
varying float depth;
uniform float clock, phase;
void main(){
  float filaments=.5+.5*sin(st.x*37.699+st.y*15.-clock*2.+phase+1.6*sin(st.y*12.-clock));
  float front=smoothstep(-.25,.35,depth);
  vec3 tint=mix(vec3(.22,.055,.68),vec3(.75,.61,1.),front*filaments);
  tint=mix(vec3(.96,.91,1.),tint,smoothstep(.03,.44,st.y));
  float opacity=(.10+.43*filaments*front)*(1.-smoothstep(.63,1.,st.y))*smoothstep(0.,.09,st.y);
  gl_FragColor=vec4(tint,opacity);
}`;

export function mountFire(canvas) {
  let renderer;
  try { renderer=new WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"}); }
  catch { return null; }
  renderer.setSize(canvas.width,canvas.height,false);
  renderer.setClearColor(0,0);
  const scene=new Scene(), body=new Group();
  scene.add(body);
  const camera=new PerspectiveCamera(36,canvas.width/canvas.height,.1,12);
  camera.position.set(.12,.64,4.05);
  camera.lookAt(0,.25,0);
  const stone=new IcosahedronGeometry(.43,0);
  const colors=[], pos=stone.attributes.position;
  for(let i=0;i<pos.count;i+=3){
    const tint=new Color().setHSL(.73+.025*Math.sin(i),.75,.21+.48*(.5+.5*Math.cos(i*1.8)));
    for(let j=i;j<i+3;j++){
      const y=pos.getY(j);
      pos.setXYZ(j,pos.getX(j)*(.83+y*.4),y*1.32,pos.getZ(j)*.79);
      colors.push(tint.r,tint.g,tint.b);
    }
  }
  stone.setAttribute("color",new Float32BufferAttribute(colors,3));
  const rock=new Mesh(stone,new MeshBasicMaterial({vertexColors:true}));
  rock.position.y=-.25;
  body.add(rock);
  const edges=new Mesh(stone,new MeshBasicMaterial({color:0xdcb7ff,wireframe:true,transparent:true,opacity:.56}));
  rock.add(edges);
  const surface=new SphereGeometry(1,32,24);
  const flames=Array.from({length:5},(_,i)=>{
    const uniforms={clock:{value:0},phase:{value:i*2.4},height:{value:1.55+.48*Math.sin(i*2)},width:{value:.48-i*.037},twist:{value:2.9+i*.31}};
    const material=new ShaderMaterial({uniforms,vertexShader:plumeVertex,fragmentShader:plumeFragment,
      transparent:true,depthWrite:false,side:DoubleSide,blending:AdditiveBlending});
    const mesh=new Mesh(surface,material);
    body.add(mesh);
    return uniforms;
  });
  const bead=new IcosahedronGeometry(.047,0), ash=new MeshBasicMaterial({color:0xdcbeff});
  const embers=Array.from({length:8},()=>{const m=new Mesh(bead,ash);body.add(m);return m;});
  return {
    draw(t,view=0){
      body.rotation.y=t*.65+view;
      rock.rotation.set(.16*Math.sin(t),t*.23,.22);
      for(const u of flames)u.clock.value=t;
      embers.forEach((m,i)=>{
        const life=(t*.34+i*.173)%1, a=i*2.4+life*3;
        m.position.set(Math.cos(a)*(.26+.35*life),-.36+1.68*life,Math.sin(a)*(.26+.35*life));
        m.scale.setScalar(Math.sin(life*Math.PI)*.95);
      });
      renderer.render(scene,camera);
    },
    dispose(){
      const materials=new Set();
      scene.traverse(o=>{if(o.material)materials.add(o.material);});
      for(const m of materials)m.dispose();
      stone.dispose();surface.dispose();bead.dispose();renderer.dispose();renderer.forceContextLoss();
    },
  };
}
