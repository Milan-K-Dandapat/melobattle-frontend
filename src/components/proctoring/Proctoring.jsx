import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const Proctoring = ({ setWarningsCount, setLastScreenshot, lastScreenshot, examEnded }) => {
  const videoRef = useRef(null);
  const detectionInterval = useRef(null);
  const canvasRef = useRef(null);

  const [warning, setWarning] = useState("");
  const [localWarnings, setLocalWarnings] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
const [faceWarnings, setFaceWarnings] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const lastViolationTime = useRef(0);
  const noFaceStartTime = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(true);

  // 📦 Load Models
  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

console.log("TinyFaceDetector loaded:", faceapi.nets.tinyFaceDetector.params);
      console.log("Models loaded ✅");
      setModelsLoaded(true);
    } catch (err) {
      console.error("Model load error ❌", err);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);
  useEffect(() => {
  if (modelsLoaded && !cameraStarted) {
    startCamera();
  }
}, [modelsLoaded]);
//   useEffect(() => {
//   if (modelsLoaded) {
//     startCamera();
//   }
// }, [modelsLoaded]);

  // 🎥 Start Camera
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play(); // 🔥 IMPORTANT
      startFaceDetection();
      setCameraStarted(true); // ✅ mark started
    };

  } catch (err) {
    console.error("Camera error:", err);
    setWarning("Camera access denied ❌");
  }
};

const stopCamera = () => {
  if (videoRef.current?.srcObject) {
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
  }
};



const captureScreenshot = () => {
  const video = videoRef.current;
  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const image = canvas.toDataURL("image/png");

  setLastScreenshot(image); // parent state (prop)

  return image; // ✅ RETURN IMAGE
};

const sendToBackend = async (type, message, screenshot = null) => {
  try {
    await fetch("http://localhost:5000/api/proctoring/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: "student1", // later dynamic
        type,
        message,
        screenshot,
        time: new Date().toISOString()
      })
    });
  } catch (err) {
    console.log("Error sending log");
  }
};

const triggerWarning = (message, type = "GENERAL") => {
  const now = Date.now();

if (now - lastViolationTime.current < 2000) return;

  lastViolationTime.current = now;

  setWarning(message);
  setWarningsCount((prev) => prev + 1);
  setLocalWarnings((prev) => prev + 1);

  // 🔥 TYPE BASED COUNT
  if (type === "TAB") {
    setTabWarnings((prev) => prev + 1);
  }

if (type === "FACE" || type === "MULTIPLE_FACE") {
  setFaceWarnings((prev) => prev + 1);
}

  const image = captureScreenshot();
  sendToBackend(type, message, image);
};

  // 👁️ Face Detection Loop
const startFaceDetection = () => {
  if (detectionInterval.current) return;

  detectionInterval.current = setInterval(async () => {
    if (videoRef.current && videoRef.current.readyState >= 2 && modelsLoaded) {
      
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320, 
          scoreThreshold: 0.3 // Keep this, it helps in low light
        })
      );

      // --- LOGIC START ---
      if (detections.length === 0) {
        // Start the timer if it hasn't started
        if (!noFaceStartTime.current) {
          noFaceStartTime.current = Date.now();
        }

        const timeSinceLost = Date.now() - noFaceStartTime.current;

        // 1. Just a UI hint first (not a violation)
        if (timeSinceLost > 1500) {
          setWarning("Please look at the camera ⚠️");
        }

        // 2. Strict violation only after 6 seconds (Relaxed from 2s)
        if (timeSinceLost > 5000) {
          console.log("🚨 Violation: No face for 6 seconds");
          triggerWarning("Face not detected for too long ⚠️", "FACE");
          
          // IMPORTANT: Reset timer so they get another 6s before next warning
          noFaceStartTime.current = Date.now();
        }

      } else if (detections.length > 1) {
        // Multiple faces is usually a clearer sign of cheating, 
        // but we can add a small 1s buffer here too if you want.
        triggerWarning("Multiple faces detected 🚨", "MULTIPLE_FACE");

      } else {
        // ✅ Face found: Reset everything
        noFaceStartTime.current = null;
        setWarning("");
      }
      // --- LOGIC END ---

      // (Keep your canvas drawing logic here...)
      const canvas = canvasRef.current;
      const displaySize = { width: 320, height: 240 };
      faceapi.matchDimensions(canvas, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      resizedDetections.forEach(det => {
        ctx.strokeStyle = "lime";
        ctx.strokeRect(det.box.x, det.box.y, det.box.width, det.box.height);
      });
    }
  }, 1000); // Increased to 1 second intervals for less "strict" feel
};
useEffect(() => {
  return () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };
}, []);

  // 🚫 Tab Switch Detection
  useEffect(() => {
    const handleVisibility = () => {
     if (document.hidden) {
  triggerWarning("Tab switch detected ⚠️", "TAB");
}
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // 🔒 Fullscreen Enforcement
useEffect(() => {
  const enterFullscreen = () => {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  enterFullscreen();

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      triggerWarning("Exited fullscreen 🚫", "FULLSCREEN");
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}, []);
// 🚫 Block Copy / Paste / DevTools
useEffect(() => {
  const handleCopy = (e) => {
    e.preventDefault();
    triggerWarning("Copy blocked 🚫", "COPY");
  };

  const handlePaste = (e) => {
    e.preventDefault();
    triggerWarning("Paste blocked 🚫", "PASTE");
  };

  const handleKeyDown = (e) => {
    // Block Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+Shift+I
    if (
      (e.ctrlKey && ["c", "v", "u"].includes(e.key.toLowerCase())) ||
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
      e.key === "F12"
    ) {
      e.preventDefault();
      triggerWarning("Blocked shortcut 🚫", "SHORTCUT");
    }
  };

  document.addEventListener("copy", handleCopy);
  document.addEventListener("paste", handlePaste);
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("copy", handleCopy);
    document.removeEventListener("paste", handlePaste);
    document.removeEventListener("keydown", handleKeyDown);
  };
}, []);

useEffect(() => {
  let audioContext;
  let analyser;
  let microphone;
  let dataArray;
  let interval;

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      microphone.connect(analyser);

      interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);

        const volume =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        if (volume > 70) {
          triggerWarning("Noise detected 🎤", "NOISE");
        }
      }, 2000);

    } catch (err) {
      console.log("Mic permission denied");
    }
  };

  startAudio();

  return () => {
    if (interval) clearInterval(interval);
    if (audioContext) audioContext.close();
  };
}, []);
  // 🚨 Auto Disqualification
  const [isDisqualified, setIsDisqualified] = useState(false);

useEffect(() => {
  if (isDisqualified) return;

  // ❌ TAB → 3 times
  if (tabWarnings >= 3) {
    setIsDisqualified(true);
    stopCamera();
    alert("Disqualified: Tab switching detected ❌");
    return;
  }

  // ❌ FACE → 15 times
  if (faceWarnings >= 15) {
    setIsDisqualified(true);
    stopCamera();
    alert("Disqualified: Malpractice detected (Face violations) ❌");
    return;
  }

}, [faceWarnings, tabWarnings, isDisqualified]);

// ⏱ Auto stop camera when exam ends
useEffect(() => {
  if (examEnded) {
    stopCamera();
  }
}, [examEnded]);
<style>
{`
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.2; }
  100% { opacity: 1; }
}
`}
</style>
  return (
  <div className="text-white text-xs">
      <h2>AI Proctoring 🎥</h2>
{!cameraStarted && (
  <button
    onClick={startCamera}
    style={{
      padding: "10px 20px",
      background: "#6366f1",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      marginBottom: "10px"
    }}
  >
    🎥 Start Camera
  </button>
)}

<div style={{ textAlign: "center", marginTop: "30px" }}>
  
  {/* CAMERA BOX */}
  <div style={{ 
    position: "relative", 
    width: "320px", 
    margin: "0 auto" 
  }}>
    {/* 🔴 FAKE RECORDING INDICATOR */}
<div style={{
  position: "absolute",
  top: "10px",
  left: "10px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "rgba(0,0,0,0.6)",
  padding: "4px 8px",
  borderRadius: "6px",
  zIndex: 10
}}>
  <div style={{
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "red",
    animation: "blink 1s infinite"
  }} />
  <span style={{ fontSize: "12px", color: "white" }}>
    Recording
  </span>
</div>
    <video
      ref={videoRef}
      autoPlay
      playsInline
      width="320"
      height="240" 
      style={{ border: "2px solid white", borderRadius: "10px" }}
    />

    <canvas
  ref={canvasRef}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "320px",
    height: "240px",
    pointerEvents: "none"
  }}
/>
  </div>

  <br />

  {/* BUTTON */}


<h3>Total Warnings: {localWarnings}</h3>
<p>Face Warnings: {faceWarnings}</p>
<p>Tab Warnings: {tabWarnings}</p>
  {/* WARNING TEXT */}
  {warning && (
    <p style={{ color: "red", fontWeight: "bold" }}>
      {warning}
    </p>
  )}

  {/* SCREENSHOT */}
  {lastScreenshot && (
    <div>
      <h4>Violation Screenshot:</h4>
      <img 
        src={lastScreenshot} 
        width="200" 
        style={{ border: "2px solid red", borderRadius: "10px" }}
      />
    </div>
  )}

</div>

    </div>
  );
};

export default Proctoring;