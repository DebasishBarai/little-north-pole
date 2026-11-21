export const SITE = {
  name: "Little North Pole",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://littlenorthpole.com").replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@littlenorthpole.com",
  owner: "Debasish Barai",
  location: "West Bengal, India",
  updated: "November 21, 2026",
};
