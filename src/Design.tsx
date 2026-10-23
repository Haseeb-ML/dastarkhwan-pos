import React from "react"

type IconName = "grid" | "orders" | "menu" | "users" | "stock" | "chart" | "settings" | "search" | "plus" | "minus" | "check" | "clock" | "table" | "wifi" | "printer" | "download" | "send" | "card" | "cash" | "arrow" | "close"

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),

    orders: (
      <>
        <path d="M6 3h12v18H6z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),

    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),

    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-4 2-6 6-6s6 2 6 6M16 5c3 0 4 4 1 6M17 14c3 .5 4 2 4 5" />
      </>
    ),

    stock: (
      <>
        <path d="M4 7l8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10" />
      </>
    ),

    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.3 3a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.3 3h5l.3-3a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </>
    ),

    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,

    check: <path d="M5 12l4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    table: (
      <>
        <path d="M4 10h16M6 10V7h12v3M6 10v9M18 10v9" />
      </>
    ),

    wifi: (
      <>
        <path d="M4 10a12 12 0 0 1 16 0M7 14a8 8 0 0 1 10 0M10 18a3 3 0 0 1 4 0" />
        <circle cx="12" cy="20" r=".5" />
      </>
    ),

    printer: (
      <>
        <path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7z" />
      </>
    ),

    download: (
      <>
        <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
      </>
    ),

    send: (
      <>
        <path d="M22 2L9 15M22 2l-7 20-4-9-9-4z" />
      </>
    ),

    card: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </>
    ),

    cash: (
      <>
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <circle cx="12" cy="12.5" r="3" />
        <path d="M5 9h.1M19 16h.1" />
      </>
    ),

    arrow: <path d="M9 18l6-6-6-6" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export const photos = {
  karahi: "/media/karahi.jpg",

  curry: "/media/curry.jpg",

  biryani:
    "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=700&q=85",

  rice: "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=700&q=85",

  bbq: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=700&q=85",

  kebab:
    "https://images.unsplash.com/photo-1649295948526-fd64e7248754?auto=format&fit=crop&w=700&q=85",

  naan: "https://images.unsplash.com/photo-1690915475901-6c08af925906?auto=format&fit=crop&w=700&q=85",

  daal: "https://images.unsplash.com/photo-1788601988466-9f361c34c6cb?auto=format&fit=crop&w=700&q=85",
}

export const nav = [
  ["New Order", "grid"],
  ["Orders & Kitchen", "orders"],
  ["Menu", "menu"],
  ["Customers", "users"],

  ["Stock & Purchases", "stock"],
  ["Daily Summary", "chart"],
  ["Settings", "settings"],
] as [string, IconName][]

export function Brand({
  name = "Shah Brothers Restaurant",
  tagline = "Restaurant & Desi Kitchen",
  logo = "/media/shah-brothers-logo.png",
}: {
  name?: string
  tagline?: string
  logo?: string
}) {
  return (
    <div className="brand">
      {logo ? (
        <img
          src={logo}
          alt={name}
          className="brand-logo-img"
          style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "contain", background: "#ffffff", padding: "2px", boxShadow: "0 2px 6px rgba(0,0,0,0.18)", flexShrink: 0 }}
        />
      ) : (
        <div className="brand-mark">{name[0]}</div>
      )}
      <div>
        <strong>{name}</strong>
        <span>{tagline.toUpperCase()}</span>
      </div>
    </div>
  )
}
