/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**", // Wildcard to allow all HTTPS domains
        port: "",
        pathname: "/**",
      },
    ],
  },
  
};

export default nextConfig;