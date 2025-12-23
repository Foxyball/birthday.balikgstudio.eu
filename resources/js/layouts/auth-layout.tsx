import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';

export default function AuthLayout({
    children,
    title,
    description,
    imageUrl,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    imageUrl?: string;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} imageUrl={imageUrl} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
