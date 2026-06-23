import * as React from 'react';
export interface SelectFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  icon?: unknown;
  optional?: string;
  error?: boolean;
  help?: string;
  containerStyle?: unknown;
}
export declare const SelectField: React.FC<SelectFieldProps>;
