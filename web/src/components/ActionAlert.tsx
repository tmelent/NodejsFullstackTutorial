import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  IconButton,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";

interface ActionAlertProps {
  text: string;
  icon: React.ReactElement;
  ariaLabel: string;
  className: string;
  onClick?: any;
}

export const ActionAlert: React.FC<ActionAlertProps> = ({
  text,
  icon,
  ariaLabel,
  className,
  onClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = async (value?: boolean) => {
    setIsOpen(false);
    if (onClick && value) {
      await onClick();
    }
  };

  const cancelRef = useRef();

  return (
    <>
      <IconButton
        onClick={() => {
          setIsOpen(true);
        }}
        className={className}
        icon={icon}
        aria-label={ariaLabel}
      />

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef as any}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {text}
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef as any} onClick={() => onClose(false)}>
                Cancel
              </Button>
              <Button className="deleteBtn" onClick={() => onClose(true)} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
