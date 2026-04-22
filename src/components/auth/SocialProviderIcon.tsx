import Svg, { Path } from "react-native-svg";

type SocialProviderIconProps = {
  provider: "google";
  size?: number;
};

export function SocialProviderIcon({
  provider,
  size = 18,
}: SocialProviderIconProps) {
  if (provider === "google") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M24 12.273c0-.818-.073-1.636-.227-2.436H12v4.618h6.727a5.748 5.748 0 0 1-2.491 3.764v3.127h4.036C22.636 19.2 24 16.036 24 12.273z"
          fill="#4285F4"
        />
        <Path
          d="M12 24c3.273 0 6-1.091 8-2.945l-3.764-2.91c-1.091.727-2.473 1.164-4.236 1.164-3.236 0-5.982-2.182-6.982-5.127H.873v3.273A12.001 12.001 0 0 0 12 24z"
          fill="#34A853"
        />
        <Path
          d="M5.018 14.182A7.205 7.205 0 0 1 4.636 12c0-.764.127-1.509.382-2.182V6.545H.873A11.94 11.94 0 0 0 0 12c0 1.964.473 3.818 1.309 5.455l3.709-3.273z"
          fill="#FBBC05"
        />
        <Path
          d="M12 4.691c1.782 0 3.364.618 4.618 1.818l3.455-3.455C18 1.2 15.273 0 12 0A11.99 11.99 0 0 0 .873 6.545l4.145 3.273c1-2.945 3.746-5.127 6.982-5.127z"
          fill="#EA4335"
        />
      </Svg>
    );
  }

  return null;
}
