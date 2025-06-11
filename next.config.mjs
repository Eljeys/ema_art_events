/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.smk.dk", // Denne er allerede inkluderet, men primær entry point
      },
      {
        protocol: "https",
        hostname: "iip-thumb.smk.dk", // Bruges ofte til thumbnails
      },
      {
        protocol: "https",
        hostname: "iip.smk.dk", // <--- VIGTIGT: Tilføj denne, da den indlejrede URL ofte kommer herfra!
      },
    ],
  },
};

export default nextConfig;
