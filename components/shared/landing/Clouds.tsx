import styles from "./landing.module.css";
import { cn } from "@/lib/utils";

type CloudShapeProps = {
  className?: string;
  animationClassName?: string;
};

const CloudShape = ({ className, animationClassName }: CloudShapeProps) => (
  <div
    className={cn(
      "absolute rounded-full blur-2xl",
      animationClassName,
      className,
    )}
  />
);

/**
 * Low-opacity, slowly drifting cloud blobs placed behind hero content.
 * Pure CSS/SVG-free implementation to keep the hero lightweight.
 */
const Clouds = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <CloudShape
        className="left-[8%] top-[12%] h-32 w-64 bg-white opacity-70 sm:h-40 sm:w-80"
        animationClassName={styles.cloud}
      />
      <CloudShape
        className="right-[10%] top-[18%] h-24 w-56 bg-sky-100 opacity-60 sm:h-28 sm:w-72"
        animationClassName={styles.cloudReverse}
      />
      <CloudShape
        className="left-[20%] top-[55%] h-28 w-72 bg-white opacity-60 sm:h-32 sm:w-96"
        animationClassName={styles.cloudReverse}
      />
      <CloudShape
        className="right-[15%] bottom-[10%] h-24 w-64 bg-sky-100 opacity-50 sm:h-28 sm:w-80"
        animationClassName={styles.cloud}
      />
      <CloudShape
        className="left-[45%] top-[5%] h-16 w-40 bg-white opacity-50"
        animationClassName={styles.cloud}
      />
    </div>
  );
};

export default Clouds;
