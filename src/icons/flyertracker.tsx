import React from "react";
import flyertacker from "../../public/images/FlyerTracker.jpg";

type ImgIconProps = {
  size?: number;
  className?: string;
};

const FlyerTracker: React.FC<ImgIconProps> = ({ size = 24, className }) => {
  return (
    <img
      src={flyertacker}
      alt="Tracker"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default FlyerTracker;
