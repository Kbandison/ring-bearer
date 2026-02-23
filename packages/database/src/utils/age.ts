import { differenceInYears, parseISO } from 'date-fns'

export const calculateAge = (birthDate: string): number =>
  differenceInYears(new Date(), parseISO(birthDate))

export const isValidAge = (age: number): boolean => age >= 18 && age <= 99
