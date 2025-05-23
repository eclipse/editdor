interface ITextAreaProps {
  id: string;
  label: string;
  placeholder?: string;
}

const DialogTextArea: React.FC<ITextAreaProps> = (props) => {
  return (
    <>
      <label
        htmlFor={props.id}
        className="pl-2 text-sm font-medium text-gray-400"
      >
        {props.label}:
      </label>
      <textarea
        id={props.id}
        rows={5}
        className="w-full appearance-none rounded border-2 border-gray-600 bg-gray-600 p-2 leading-tight text-white focus:border-blue-500 focus:outline-none sm:text-sm"
        placeholder={props.placeholder}
      />
    </>
  );
};

export default DialogTextArea;
