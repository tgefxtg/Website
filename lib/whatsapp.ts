export const WHATSAPP_NUMBER = "966536493716";
export const DISPLAY_PHONE = "+966 53 649 3716";
export const generalMessage =
  "Hello Abha Tourist Center 👋\nI would like to know more about your Abha tours.";
export function whatsappUrl(message = generalMessage) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
export function destinationMessage(name: string) {
  return `Hello Abha Tourist Center 👋\nI'm interested in visiting ${name}.\nCould you please send me more information?`;
}
export function tripMessage(interests: string[], names: string[]) {
  return `Hello Abha Tourist Center 👋\nI'd like to plan a trip.\nInterests: ${interests.length ? interests.join(", ") : "Open to suggestions"}\nPlaces I'd like to visit: ${names.length ? names.join(", ") : "Please recommend some destinations"}\nCould you help me plan my journey?`;
}
