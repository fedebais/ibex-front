import type { ReactNode } from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
  darkMode?: boolean
}

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md", darkMode = false }: ModalProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`${darkMode ? "bg-gray-800 text-white" : "bg-white"} rounded-lg shadow-xl overflow-hidden w-full ${maxWidth} max-h-[90vh] transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex items-center justify-between`}
        >
          <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-500"} focus:outline-none`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-4rem)]">{children}</div>
      </div>
    </div>
  )
}

export default Modal
