import { Button as ReaButton, ButtonProps } from "reakit";
import classNames from "classnames";

type Props = ButtonProps & {
  green?: boolean;
  rounded?: boolean;
  active?: boolean;
};

function Button(props: Props) {
  const color = props.disabled ? "gray" : props.green ? "green" : "blue";
  return (
    <ReaButton
      {...props}
      className={classNames(
        `hover:bg-${color}-700 text-white font-bold py-2 px-4 ${
          props.rounded === false ? "" : "rounded"
        } ${props.active ? `bg-${color}-800` : `bg-${color}-500`}`,
        props.className,
        {}
      )}
    />
  );
}

export default Button;
