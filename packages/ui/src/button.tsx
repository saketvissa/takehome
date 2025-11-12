import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button = ({ children, className, onClick, disabled }: ButtonProps) => {
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
