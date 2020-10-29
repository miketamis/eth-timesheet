import { Input as ReaInput, InputProps } from "reakit";
import classNames from "classnames";

type Props = InputProps & {
  error?: boolean;
};
function Input({ error, className, ...props }: Props) {
  return (
    <ReaInput
      {...props}
      className={classNames(
        "shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
        {
          "text-red-500 border-red-600": error,
        },
        className
      )}
    />
  );
}

export default Input;
