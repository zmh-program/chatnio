import "@/assets/common/loader.less";

type LoaderProps = {
  className?: string;
  prompt?: string;
};

function Loader({ className, prompt }: LoaderProps) {
  return (
    <div className={`loader-wrapper ${className}`}>
      <div className={`loader`} />
      <p>{prompt}</p>
    </div>
  );
}

export default Loader;
