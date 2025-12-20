import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { DriverHomeScreen } from "@/features/driver/components/DriverHomeScreen";

const Driver = () => {
  return (
    <AuthGuard requireAuth={false}>
      <MainLayout>
        <DriverHomeScreen />
      </MainLayout>
    </AuthGuard>
  );
};

export default Driver;
