import { createContext, useContext, useRef, useState } from "react";
import bgMusic from "../assets/audio/bg-music.mp3";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(new Audio(bgMusic));

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);

  const playMusic = () => {
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const stopMusic = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  };

  const changeVolume = (value) => {
    audioRef.current.volume = value;
    setVolume(value);
  };

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        volume,
        toggleMusic,
        playMusic,
        stopMusic,
        changeVolume
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);