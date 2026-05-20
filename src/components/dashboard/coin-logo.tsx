import Image from "next/image";

type CoinLogoProps = {
  imageUrl: string | null;
  symbol: string;
};

export function CoinLogo({ imageUrl, symbol }: CoinLogoProps) {
  if (imageUrl) {
    return (
      <Image
        alt={`${symbol} logo`}
        className="coin-logo"
        height={34}
        src={imageUrl}
        width={34}
      />
    );
  }

  return <span className="coin-logo fallback">{symbol.slice(0, 1)}</span>;
}
