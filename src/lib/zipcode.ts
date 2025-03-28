export async function getCityStateFromZip(zipCode: string) {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    const data = await response.json();
    const place = data.places[0];
    return {
      city: place['place name'],
      state: place['state abbreviation']
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
} 