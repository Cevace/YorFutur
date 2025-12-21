export default function CMSLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <div style={{ margin: 0, minHeight: '100vh' }}>{children}</div>;
}
