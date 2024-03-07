import { GiHealthNormal, GiMeal } from "react-icons/gi";
import { FaWeightHanging } from "react-icons/fa6";
import { ImSad2, ImHappy2 } from "react-icons/im";
import { RiEmotionNormalFill } from "react-icons/ri";

export default function Indicators({ happiness_meter, hungry_meter, weight, isSick }) {

  const hapinessEmoticon = (happiness_meter) => {
    if (happiness_meter > 2) {
      return (
        <ImHappy2
          className="text-white"
          style={{
            width: "24px",
            height: "24px",
          }}
        />
      )
    } else if (happiness_meter == 2) {
      return (
        <RiEmotionNormalFill
          className="text-white"
          style={{
            width: "28px",
            height: "28px",
          }}
        />
      )
    } else {
      return (
        <ImSad2
          className="text-white"
          style={{
            width: "24px",
            height: "24px",
          }}
        />
      )
    }
  }

  return (
    <div className="flex flex-row justify-center align-middle items-center space-y-2 gap-5 cursor-default mt-5">
      {happiness_meter !== null && (
        <div
          className="flex flex-row gap-1 text-xs items-center mt-2"
          title={`Happiness: ${happiness_meter}`}
        >
          {hapinessEmoticon(happiness_meter)}
          {" "}
          {happiness_meter}
        </div>
      )}
      <div
        className="flex flex-row gap-1 text-xs items-center mt-2"
        title={`Hungry: ${hungry_meter}`}
      >
        <GiMeal
          className="text-white"
          style={{
            width: "32px",
            height: "32px",
          }}
        />{" "}
        {hungry_meter}
      </div>
      <div className="flex flex-row gap-1 text-xs items-center" title="Weight">
        <FaWeightHanging
          className="text-white"
          style={{
            width: "24px",
            height: "24px",
          }}
        />{" "}
        {weight}
      </div>
      <GiHealthNormal
        className={`${isSick ? "text-red-600" : "text-red-100 opacity-35"}`}
        style={{
          width: "24px",
          height: "24px",
        }}
        title="Health"
      />
    </div>
  );
}
