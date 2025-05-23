import React from "react";
import ReactDOM from "react-dom";
import DialogTemplate from "./DialogTemplate";

interface ErrorDialogProps {
  isOpen: boolean;
  errorMessage: string;
  onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  errorMessage,
  onClose,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <DialogTemplate
      title="Error"
      description={errorMessage}
      onSubmit={onClose}
      submitText="OK"
      className="text-lg"
    />,
    document.getElementById("modal-root") as HTMLElement
  );
};

export default ErrorDialog;
