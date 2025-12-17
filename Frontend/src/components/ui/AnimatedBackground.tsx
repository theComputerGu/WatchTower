import { useEffect, useState } from "react";
import "./animatedBackground.css";

import bg1 from "../../assets/images/bg1.png";
import bg2 from "../../assets/images/bg2.png";
import bg3 from "../../assets/images/bg3.png";


const images = [bg1, bg2, bg3];

export default function AnimatedBackground() {
  const [index, setIndex] = useState(0);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNext(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setShowNext(false);
      }, 200); // זמן מעבר (fade)
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const nextIndex = (index + 1) % images.length;

  return (
    <div className="animated-bg">
      {/* current */}
      <div
        className={`bg-slide base`}
        style={{ backgroundImage: `url(${images[index]})` }}
      />
      {/* next (נכנס בפייד) */}
      <div
        className={`bg-slide top ${showNext ? "show" : ""}`}
        style={{ backgroundImage: `url(${images[nextIndex]})` }}
      />
      <div className="bg-overlay" />
    </div>
  );
}
