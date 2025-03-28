export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX
  if (numbers.length <= 3) {
    return numbers
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`
  }
  
  // If more than 10 digits, truncate to 10
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
}

export const lookupZipCode = async (zipCode: string): Promise<{ city: string; state: string } | null> => {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`)
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    const place = data.places[0]
    
    return {
      city: place['place name'],
      state: place.state
    }
  } catch (error) {
    console.error('Error looking up ZIP code:', error)
    return null
  }
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
} 