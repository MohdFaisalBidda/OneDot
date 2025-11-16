import { AuthDialogProvider } from "@/components/custom/AuthDialog";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthDialogProvider>
      {children}
    </AuthDialogProvider>
  );
}
