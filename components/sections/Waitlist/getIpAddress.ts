export async function getIpAddress(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) return "";
    const data = await response.json();
    return data.ip ?? "";
  } catch {
    return "";
  }
}
