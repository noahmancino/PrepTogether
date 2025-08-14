import type { ChangeEvent } from "react";
import "../styles/App.css";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function PassageEditor({ value, onChange }: Props) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
    onChange(e.target.value);
  };

  return (
    <textarea
      className="passage-textarea"
      value={value}
      onChange={handleChange}
    />
  );
}
