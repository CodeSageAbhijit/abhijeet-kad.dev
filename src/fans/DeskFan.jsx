import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function DeskFan() {
  const canvas = useRef(null);
  useEffect(() => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({canvas:canvas.current,alpha:true,antialias:true}); }
    catch { return; }
    renderer.setSize(256,300,false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32,256/300,.1,20);
    camera.position.set(2,.9,4.8);
    camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight(0xffffff,0x6c768f,2));
    const lamp = new THREE.DirectionalLight(0xffffff,2);
    lamp.position.set(-2,4,3);
    scene.add(lamp);
    function part(geometry,color,x,y,z,parent=scene) {
      const mesh = new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,metalness:.45,roughness:.34}));
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    part(new THREE.CylinderGeometry(.5,.55,.12,32),0x24615c,0,-1,0);
    part(new THREE.CylinderGeometry(.09,.13,1,16),0x91afb9,0,-.5,0);
    const rotor = new THREE.Group();
    rotor.position.y=.32;
    scene.add(rotor);
    const motor=part(new THREE.CylinderGeometry(.27,.32,.54,32),0x255555,0,.32,-.32);
    motor.rotation.x=Math.PI/2;
    const profile=new THREE.Shape();
    profile.moveTo(.06,0);
    profile.bezierCurveTo(.22,-.04,.69,-.08,.71,.11);
    profile.bezierCurveTo(.76,.43,.33,.42,.09,.12);
    profile.closePath();
    for(let i=0;i<5;i++){
      const blade=part(new THREE.ExtrudeGeometry(profile,{depth:.034,bevelSize:.018,bevelThickness:.015,bevelSegments:2}),0xd8a457,0,0,0,rotor);
      blade.rotation.z=i*2*Math.PI/5;
    }
    for(const radius of [.22,.38,.54,.68,.79]){
      part(new THREE.TorusGeometry(radius,.014,8,64),0xc1cace,0,.32,.36-.34*radius*radius);
    }
    for(let i=0;i<18;i++){
      const angle=i*Math.PI/9;
      const points=[[.12,.36],[.51,.29],[.79,.14],[.8,-.07],[.65,-.21],[.28,-.32]].map(([r,z])=>new THREE.Vector3(r*Math.cos(angle),.32+r*Math.sin(angle),z));
      part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),12,.012,5,false),0xacbcbf,0,0,0);
    }
    part(new THREE.SphereGeometry(.14,16,12),0x284b50,0,.32,.34);
    canvas.current.style.opacity=1;
    renderer.render(scene,camera);
    if(!matchMedia("(prefers-reduced-motion: reduce)").matches)
      renderer.setAnimationLoop(time=>{rotor.rotation.z=time*.009;scene.rotation.y=.28*Math.sin(time*.003);renderer.render(scene,camera);});
    return ()=>{renderer.setAnimationLoop(null);scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});renderer.dispose();renderer.forceContextLoss();};
  },[]);
  return <canvas ref={canvas} className="fan-model"/>;
}
