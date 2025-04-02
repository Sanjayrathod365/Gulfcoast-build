export async function getCityStateFromZip(zipCode: string) {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (!response.ok) {
      console.log('ZIP code lookup failed, returning null');
      return null;
    }
    const data = await response.json();
    const place = data.places[0];
    return {
      city: place['place name'],
      state: place.state
    };
  } catch (error) {
    console.log('Error looking up ZIP code:', error);
    return null;
  }
} 