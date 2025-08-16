import withSerwistInit from "@serwist/next";
import type {NextConfig} from "next";

const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
    cacheOnNavigation: true,
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    additionalPrecacheEntries: [{url: "/~offline", revision}],
});

const nextConfig: NextConfig = {}

export default withSerwist(nextConfig);