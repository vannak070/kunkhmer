import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  /** Absolute URL to share. Defaults to the current page. */
  url?: string;
  /** "full" shows every network; "compact" shows one share button (native sheet or copy link). */
  variant?: "full" | "compact";
  /** Visible text for the compact button (icon only when omitted). */
  label?: string;
  className?: string;
}

function openPopup(href: string) {
  window.open(href, "_blank", "noopener,noreferrer,width=640,height=560");
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API is unavailable on plain http or when permission is denied.
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export function ShareButtons({ title, url, variant = "full", label, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    if (await copyToClipboard(shareUrl)) {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Couldn't copy the link. Please copy it from the address bar.");
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User dismissed the share sheet.
      }
    } else {
      copyLink();
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={nativeShare}
        aria-label={`Share ${title}`}
        title="Share"
        className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all ${className}`}
      >
        <Share2 className="w-4 h-4" />
        {label && <span>{label}</span>}
      </button>
    );
  }

  const networks = [
    { label: "Facebook", className: "bg-[#1877F2] hover:bg-[#166FE5]", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "X", className: "bg-gray-900 hover:bg-black", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "Telegram", className: "bg-[#229ED9] hover:bg-[#1E8BC3]", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {networks.map((n) => (
        <button
          key={n.label}
          type="button"
          onClick={() => openPopup(n.href)}
          aria-label={`Share on ${n.label}`}
          className={`px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-colors ${n.className}`}
        >
          {n.label}
        </button>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-[#0A3D91] text-gray-700 rounded-xl text-sm font-bold transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
