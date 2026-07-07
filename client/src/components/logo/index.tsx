import { AudioWaveform } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = (props: { url?: string }) => {
  const { url = "/" } = props;
  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link to={url}>
        <div className="">
          <AudioWaveform className="size-4" />
        </div>
      </Link>
    </div>
  );
};

export default Logo;
