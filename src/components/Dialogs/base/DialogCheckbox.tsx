interface ICheckboxProps {
  id: string;
  label: string;
  readOnly?: boolean;
}

const DialogCheckbox: React.FC<ICheckboxProps> = (props) => {
  return (
    <div key={props.id} className="form-checkbox pl-2">
      {(props.readOnly ?? true) ? (
        <input
          id={props.id}
          className="form-checkbox-input"
          type="checkbox"
          value={props.label}
        />
      ) : (
        <input
          id={props.id}
          className="form-checkbox-input"
          type="checkbox"
          value={props.label}
          readOnly={props.readOnly}
          checked={true}
        />
      )}
      <label className="form-checkbox-label pl-2" htmlFor={props.id}>
        {props.label}
      </label>
    </div>
  );
};

export default DialogCheckbox;
