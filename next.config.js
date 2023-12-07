/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
            protocol: 'https',
            hostname: 'static.cozyverse.xyz',
            port: '',
            pathname: '/woofys/images/**',
            },
        ],
    },
}

module.exports = nextConfig
