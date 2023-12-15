export const formReducer = <T>() => {
  return (state: T, action: any) => {
    action.payload = action.payload ?? action.value;

    switch (action.type) {
      case "update":
        return { ...state, ...action.payload };
      case "reset":
        return { ...action.payload };
      default:
        if (action.type.startsWith("update:")) {
          const key = action.type.slice(7);
          return { ...state, [key]: action.payload };
        }
    }
  };
};
