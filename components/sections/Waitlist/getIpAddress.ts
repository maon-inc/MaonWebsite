export interface LocationData {
  country: string;
  region: string;
}

export async function getLocation(): Promise<LocationData> {
  try {
    // Using ipapi.co for free IP geolocation (no API key required for basic usage)
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      return { country: "", region: "" };
    }
    const data = await response.json();
    return {
      country: data.country_name ?? data.country ?? "",
      region: data.region ?? data.region_code ?? "",
    };
  } catch {
    return { country: "", region: "" };
  }
}
