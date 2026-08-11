import { PlatformNavbar } from '~/app/(platform)/navbar';
import { PlatformSidebar } from '~/app/(platform)/sidebars';
import { SidebarProvider } from '~/components/ui/sidebar';
import { Sidedock } from '~/app/(platform)/sidedock';
import { ReactNode } from 'react';

const PlatformLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <div className="bg-background flex h-full min-h-0 w-full flex-col overflow-hidden">
        <PlatformNavbar />

        <div className="flex h-full">
          <div className="flex w-108 flex-none justify-between">
            <Sidedock />
            <PlatformSidebar />
          </div>

          <main className="h-full min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PlatformLayout;
