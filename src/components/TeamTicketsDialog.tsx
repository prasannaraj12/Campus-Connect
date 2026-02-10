import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Users } from 'lucide-react'
import QRCode from 'react-qr-code'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
}

export default function TeamTicketsDialog({ isOpen, onClose, registration }: Props) {


  // Safely get registration data
  const registrationCodes = registration?.allRegistrationCodes || [registration?.registrationCode] || [];
  const registrationIds = registration?.allRegistrationIds || [registration?._id] || [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="neo-brutal-lg bg-white p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-black">Team Tickets</h2>
              <p className="font-semibold text-gray-600">{registrationIds.length} QR Codes Generated</p>
            </div>
            <button
              onClick={onClose}
              className="neo-brutal-sm bg-red-400 p-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="neo-brutal bg-green-100 p-4 mb-6">
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <p className="font-black mb-2">Team Registration Successful!</p>
                <p className="font-semibold text-sm">
                  Each team member has their own QR code. Download and share them with your team.
                  Each person must show their individual QR code at the event for attendance.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {registrationCodes.map((code: string, index: number) => (
              <motion.div
                key={code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="neo-brutal bg-white p-6"
              >
                <div className="text-center mb-4">
                  <p className="font-black text-lg">
                    {index === 0 ? 'Team Leader' : `Member ${index}`}
                  </p>
                  <p className="text-3xl font-black text-blue-600 mt-2">
                    {code}
                  </p>
                </div>

                <div className="bg-white p-4 mb-4">
                  <QRCode
                    id={`qr-${code}`}
                    value={code}
                    size={180}
                    className="mx-auto"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    window.open(`${window.location.origin}/ticket/${code}`, '_blank')
                  }}
                  className="neo-brutal-sm bg-blue-400 w-full py-2 font-bold inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  View Ticket
                </motion.button>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="neo-brutal bg-green-400 w-full py-4 font-black text-xl mt-6 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Done
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
