import Particles from "react-tsparticles";

const ParticlesBackground = () => {
  return (
    <Particles
      options={{
        background: { color: "transparent" },
        particles: {
          number: { value: 60 },
          color: { value: "#8B5CF6" },
          links: { enable: true, color: "#06B6D4" },
          move: { enable: true, speed: 1 },
          size: { value: 2 },
        },
      }}
      className="absolute inset-0"
    />
  );
};

export default ParticlesBackground;