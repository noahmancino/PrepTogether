import type { ChangeEvent } from "react";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function PassageEditor({ value, onChange }: Props) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      style={{ width: "100%", height: "120px" }}
      value={value}
      onChange={handleChange}
    />
  );
}
