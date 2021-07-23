import * as THREE from "three";
import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei';
import glsl from "babel-plugin-glsl/macro";

import React, { useRef, Suspense } from "react";
import './App.css';


const WaveShaderMaterial = shaderMaterial(
  //Uniform
  {
    uTime: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uTexture: new THREE.Texture()
  },
  //Vertex shader
  glsl`
    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
    precision mediump float;

    uniform float uTime;

    varying vec2 vUv;
    varying float vWave;

    

    void main() {
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 1.5;
      float noiseAmp = 0.25;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  //Fragment shader
  glsl`
    precision mediump float;

    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    varying float vWave;

    void main(){
      float wave = vWave * 0.1;
      vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      gl_FragColor = vec4(texture, 1.0);
    }
  `
);

extend({ WaveShaderMaterial });

const Wave = () => {
  const ref = useRef();
  useFrame(({clock}) => ref.current.uTime = clock.getElapsedTime());

  const [image] = useLoader(THREE.TextureLoader, ["tattoocar.jpg"]);
  return (
    <mesh>
      <planeBufferGeometry args={[0.4, 0.6, 16,16]} />
      <waveShaderMaterial uColor="hotpink" ref={ref} uTexture={image}/>
    </mesh>
  );
}
const Scene = () => {
  return (
    <Canvas camera={{fov: 10}}>
      <Suspense fallback={null}>
        <Wave />
      </Suspense>
    </Canvas>
  );
};

const App = () => {
  return (
    <>
      <h1>tattoo studio</h1>
      <Scene />
    </>
  );

}
export default App;
