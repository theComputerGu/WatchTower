import { useEffect, useState } from "react";
import "./animatedBackground.css";
import bg1 from "../../assets/images/bg1.png";
import bg2 from "../../assets/images/bg2.png";
import bg3 from "../../assets/images/bg3.png";


const images = [bg1, bg2, bg3];


export default function AnimatedBackground() {

  //the picture that presented:
  const [index, setIndex] = useState(0);

  //if to go to the next picture:
  const [showNext, setShowNext] = useState(false);


  //mpving one picture above the other each 2 seconds:
  useEffect(() => {
    const interval = setInterval(() => {
      setShowNext(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setShowNext(false);
      }, 200);
    }, 2000);

    return () => clearInterval(interval);
  }, []);


  //which picture next in order to create infinit loop:
  const nextIndex = (index + 1) % images.length;

  return (
    <div className="animated-bg">
      {/* current picture */}
      <div
        className={`bg-slide base`}
        style={{ backgroundImage: `url(${images[index]})` }}
      />
      {/* next picture */}
      <div
        className={`bg-slide top ${showNext ? "show" : ""}`}
        style={{ backgroundImage: `url(${images[nextIndex]})` }}
      />
      <div className="bg-overlay" />
    </div>
  );
}
