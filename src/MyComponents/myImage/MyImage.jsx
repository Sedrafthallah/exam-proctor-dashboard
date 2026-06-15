import { Image } from "antd";

export default function MyImage({
  src,
  alt = "",
  ...props
}) {
  return (
    <Image
      src={src}
      alt={alt}
      preview={false}
      {...props}
    />
  );
}
