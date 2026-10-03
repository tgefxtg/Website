import { ReactNode } from "react";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";
export function WhatsAppLink({
  message,
  children = "Chat on WhatsApp",
  className = "button button-green",
  label,
}: {
  message?: string;
  children?: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={label}
      data-magnetic
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}
