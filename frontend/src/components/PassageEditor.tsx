import {type ChangeEvent, useEffect, useRef } from "react";
import "../styles/App.css";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function PassageEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
    onChange(e.target.value);
  };

  // Auto-resize the textarea when the component mounts or value changes
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className="passage-textarea"
      value={value}
      onChange={handleChange}
    />
  );
}