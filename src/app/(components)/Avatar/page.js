"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CREATURE_IMG_NORMAL from "../../../../public/creature-image/creature_normal.png";
import CREATURE_IMG_HAPPY from "../../../../public/creature-image/creature_happy.png";
import CREATURE_IMG_SAD from "../../../../public/creature-image/creature_sad.png";
import CREATURE_IMG_BLINK from "../../../../public/creature-image/creature_blink.png";
import CREATURE_IMG_MEAL from "../../../../public/creature-image/creature_eat-meal.png";
import CREATURE_IMG_SNACK from "../../../../public/creature-image/creature_eat-snack.png";
import CREATURE_IMG_SICK from "../../../../public/creature-image/creature_sick.png";
import CREATURE_IMG_WIN from "../../../../public/creature-image/creature_win.png";
import CREATURE_IMG_LOSE from "../../../../public/creature-image/creature_lose.png";

export default function Avatar({ hapinessMeter, mealType, isSick }) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [creatureState, setCreatureState] = useState(CREATURE_IMG_NORMAL);

  useEffect(() => {
    const updatePicture = () => {
      setCreatureState(
        isSick ? CREATURE_IMG_SICK : 
          mealType === "meal" ? CREATURE_IMG_MEAL : 
            mealType === "snack" ? CREATURE_IMG_SNACK : 
              isBlinking ? CREATURE_IMG_BLINK : 
                hapinessMeter == 2 ? CREATURE_IMG_NORMAL : 
                  hapinessMeter > 2 ? CREATURE_IMG_HAPPY :
                    CREATURE_IMG_SAD
      );
    };

    updatePicture();
  }, [mealType, isSick, isBlinking]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000); // Blink every 3 seconds

    return () => clearInterval(blinkInterval); // Cleanup interval on component unmount
  }, []);

  return (
    <>
      <Image
        src={creatureState}
        width={400}
        height={600}
        style={{
          height: "auto",
          width: "auto",
        }}
        alt="Tamagotchi"
        className={`mb-4 pointer-events-none ${isSick ? "animate-breathing-sick" : "animate-breathing"}`}
      />
    </>
  );
}
