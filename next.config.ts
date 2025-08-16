import withSerwistInit from "@serwist/next";
import type {NextConfig} from "next";


const withSerwist = withSerwistInit({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js"});

const nextConfig: NextConfig = {}

export default withSerwist(nextConfig);