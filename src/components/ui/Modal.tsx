"use client"

import type React from "react"
import { useEffect } from "react"
import { useTheme } from "../../context/ThemeContext"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) => {
  const { darkMode } = useTheme()

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className={`fixed inset-0 transition-opacity ${
            darkMode ? "bg-black bg-opacity-60" : "bg-gray-500 bg-opacity-75"
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${maxWidth} ${
            darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b ${darkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h3>
              <button
                onClick={onClose}
                className={`rounded-md p-2 transition-colors ${
                  darkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                }`}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={`px-6 py-4 ${darkMode ? "bg-gray-900" : "bg-white"}`}>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
