/* eslint-disable @next/next/no-page-custom-font -- Shared App Router root layout loads this font for every page. */
import type { CSSProperties, ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL ??
	"https://sharefastweb-production.up.railway.app";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: "Super X — منصة إدارة التوصيل",
	description: "منصة إدارة التوصيل Super X",
	applicationName: "Super X",
};

export const viewport: Viewport = {
	themeColor: "#0f172a",
};

const fontVariables = {
	"--font-arabic": "Tahoma, Arial, sans-serif",
	"--font-latin": "Arial, sans-serif",
} as CSSProperties;

export default function RootLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="ar" dir="rtl" style={fontVariables}>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
