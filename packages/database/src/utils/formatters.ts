import { formatDistanceToNow, parseISO } from 'date-fns'

export const formatRelativeTime = (dateString: string): string =>
  formatDistanceToNow(parseISO(dateString), { addSuffix: true })

export const formatDistance = (km: number): string => {
  const miles = km * 0.621371
  return miles < 1 ? 'Less than 1 mile away' : `${Math.round(miles)} miles away`
}
