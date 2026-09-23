import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/tools/stripe-fee-calculator-india',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tools/stripe-vs-paypal-fee-comparison',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
