/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/graphql",
        destination: "http://localhost:4000/graphql",
      },
    ];
  },
};

module.exports = nextConfig;
