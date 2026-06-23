import * as React from 'react';
export interface AuthTextFieldProps {
  label: string;
  icon?: unknown;
  error?: boolean;
  trailing?: unknown;
  optional?: string;
  help?: string;
  containerStyle?: unknown;
  inputRef?: unknown;
}
export declare const AuthTextField: React.FC<AuthTextFieldProps>;
