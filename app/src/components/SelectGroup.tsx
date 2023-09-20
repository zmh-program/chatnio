type SelectGroupProps = {
  current: string;
  list: string[];
  onChange?: (select: string) => void;
};

function SelectGroup(props: SelectGroupProps) {
  return (
    <div className={`select-group`}>
      {props.list.map((select: string, idx: number) => (
        <div
          key={idx}
          onClick={() => props.onChange?.(select)}
          className={`select-group-item ${
            select == props.current ? "active" : ""
          }`}
        >
          {select}
        </div>
      ))}
    </div>
  );
}

export default SelectGroup;
