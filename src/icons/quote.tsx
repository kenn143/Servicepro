import React from "react";
import quoteIcon from "../../public/images/Lights-Installer-Logo.webp";

type ImgIconProps = {
  size?: number;
  className?: string;
};

const QuoteIcon: React.FC<ImgIconProps> = ({ size = 24, className }) => {
  return (
    <img
      src={quoteIcon}
      alt="Tracker"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default QuoteIcon;
