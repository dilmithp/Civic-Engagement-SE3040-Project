/**
 * GeocodingService — Single Responsibility: coordinate ↔ address conversion.
 * Uses OpenStreetMap Nominatim API (free, no API key required).
 * Dependency Inversion: consumers depend on this service, not the HTTP call directly.
 */
class GeocodingService {
    static BASE_URL = 'https://nominatim.openstreetmap.org';

    /**
     * Reverse geocode: convert coordinates → human-readable address.
     * @param {number} latitude
     * @param {number} longitude
     * @returns {Promise<{displayName: string, road: string, city: string, state: string, country: string}>}
     */
    static async reverseGeocode(latitude, longitude) {
        const url = `${this.BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'CivicEngagementApp/1.0',
                'Accept-Language': 'en'
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`Geocoding error: ${data.error}`);
        }

        const addr = data.address || {};

        return {
            displayName: data.display_name || '',
            road: addr.road || addr.street || '',
            city: addr.city || addr.town || addr.village || '',
            state: addr.state || addr.province || '',
            country: addr.country || '',
            postcode: addr.postcode || ''
        };
    }

    /**
     * Forward geocode: convert address text → coordinates.
     * @param {string} address
     * @returns {Promise<{latitude: number, longitude: number, displayName: string}>}
     */
    static async forwardGeocode(address) {
        const url = `${this.BASE_URL}/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'CivicEngagementApp/1.0',
                'Accept-Language': 'en'
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            throw new Error('No results found for the given address');
        }

        const result = data[0];
        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            displayName: result.display_name || ''
        };
    }
}

export default GeocodingService;
