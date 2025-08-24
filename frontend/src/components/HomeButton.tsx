
import "../styles/App.css";

type HomeButtonProps = {
  onGoHome: () => void;
};

export default function HomeButton({ onGoHome }: HomeButtonProps) {
  const handleHomeClick = () => {
    onGoHome();
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