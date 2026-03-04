import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Text3D } from "@react-three/drei";

const Logo3D = () => {
  return (
    <Canvas style={{ height: 200 }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Float>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
          size={1}
          height={0.2}
        >
          MELO
        </Text3D>
      </Float>
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default Logo3D;