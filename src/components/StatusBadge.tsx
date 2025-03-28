import { Status } from '@prisma/client'

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status.color === 'green'
          ? 'bg-green-100 text-green-800'
          : status.color === 'yellow'
          ? 'bg-yellow-100 text-yellow-800'
          : status.color === 'red'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status.name}
    </span>
  )
} 