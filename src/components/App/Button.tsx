interface IButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<IButtonProps> = ({ onClick, children }) => {
  return (
    <button className="min-w-8 text-white hover:opacity-50" onClick={onClick}>
      <div className="flex flex-col items-center justify-center gap-0.5">
        {children}
      </div>
    </button>
  );
};

export default Button;
