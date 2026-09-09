"use client"

import {
  createContext,
  useContext,
  useState,
} from "react"

import {
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type SuccessDialogContextType = {
  showSuccess: (
    message: string
  ) => void
}

const SuccessDialogContext =
  createContext<
    SuccessDialogContextType | undefined
  >(undefined)

export function SuccessDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [message, setMessage] =
    useState("")

  const [open, setOpen] =
    useState(false)

  function showSuccess(
    nextMessage: string
  ) {
    setMessage(nextMessage)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)

    window.setTimeout(() => {
      setMessage("")
    }, 150)
  }

  return (
    <SuccessDialogContext.Provider
      value={{
        showSuccess,
      }}
    >
      {children}

      <AlertDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleClose()
          }
        }}
      >
        <AlertDialogContent className="max-w-sm text-center">
          <AlertDialogHeader className="items-center text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-secondary">
              <CheckCircle2 className="size-7 text-secondary-foreground" />
            </div>

            <AlertDialogTitle className="text-xl">
              Success
            </AlertDialogTitle>

            <AlertDialogDescription className="text-center text-sm">
              {message}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              render={
                <Button className="min-w-24" />
              }
              nativeButton={false}
              onClick={handleClose}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SuccessDialogContext.Provider>
  )
}

export function useSuccessDialog() {
  const context =
    useContext(
      SuccessDialogContext
    )

  if (!context) {
    throw new Error(
      "useSuccessDialog must be used within SuccessDialogProvider"
    )
  }

  return context
}