import Image from "next/image";

type Props = {
  size?: number;
};

const LoadingLogo = ({ size = 100 }: Props) => {
    return <div className="flex flex-col items-center justify-center h-full">
        <Image
            src="/logo.svg"
            alt="Logo"    
            width={size}
            height={size}
            className="animate-spin"
        />
    </div>
}

export default LoadingLogo;