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
  colorScheme: string;
  func?: any;
}

export const ActionAlert: React.FC<ActionAlertProps> = ({
  text,
  icon,
  ariaLabel,
  colorScheme,
  func,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = async () => {
    setIsOpen(false);
    if (func) {
      await func();
    }
  };

  const cancelRef = useRef();

  return (
    <>
      <IconButton
        onClick={() => {
          setIsOpen(true);
        }}
        colorScheme={colorScheme}
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
              <Button ref={cancelRef as any} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onClose} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
