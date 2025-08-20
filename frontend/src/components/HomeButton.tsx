
import "../styles/App.css";

type HomeButtonProps = {
  setAppState: (state: (prevState: any) => any) => void;
};

export default function HomeButton({ setAppState }: HomeButtonProps) {
  const handleHomeClick = () => {
    setAppState((prevState) => ({
      ...prevState,
      viewMode: "home",
      activeTestId: null
    }));
  };

  return (
    <button
      className="home-button"
      onClick={handleHomeClick}
      aria-label="Return to home"
    >
      ←
    </button>
  );
}