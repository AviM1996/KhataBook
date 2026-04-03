import React, { useState } from "react";
import styles from './eyeIcons.module.css';
import { FiEye, FiEyeOff } from "react-icons/fi";

export const EyeToggle = ({ 
  isVisible, 
  onToggle, 
  className = "", 
  iconClassName = "",
  title = "" 
}) => {
  return (
    <span
      onClick={onToggle}
      className={`${styles.iconBase} ${iconClassName} ${className}`}
      title={title || (isVisible ? "Hide contents" : "Show contents")}
    >
      {isVisible ? <FiEyeOff /> : <FiEye />}
    </span>
  );
};

const EyeShow = ({
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  className = "",
  inputClassName = "",
  iconClassName = "",
  autoComplete = "",
  required = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const isPassword = type === "password";

  return (
    <div className={`${styles.container} ${className}`}>
      <input
        type={isPassword ? (isVisible ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        required={required}
        className={`${styles.input} ${inputClassName}`}
      />

      {isPassword && (
        <EyeToggle
          isVisible={isVisible}
          onToggle={() => setIsVisible((prev) => !prev)}
          className={styles.iconPosition}
          iconClassName={iconClassName}
          title={isVisible ? "Hide password" : "Show password"}
        />
      )}
    </div>
  );
};


export default EyeShow