
import { useState } from "react";

interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
}

export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions>({
    title: "",
    description: "",
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options);
      setIsOpen(true);
      
      setOnConfirmCallback(() => () => {
        setIsOpen(false);
        resolve(true);
      });
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
  };

  return {
    isOpen,
    options,
    confirm,
    handleCancel,
    handleConfirm,
    setIsOpen,
  };
};
