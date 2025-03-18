/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add support for Leaflet
    config.module.rules.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader"],
    });

    return config;
  },
  transpilePackages: ["leaflet", "react-leaflet"],
};

export default nextConfig;
