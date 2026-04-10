import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthSessionProvider } from './services/authSession';
import { FeatureSettingsProvider } from './services/featureSettings';
import { NotificationsStateProvider } from './services/notificationsState';

export default function App() {
  return (
    <AuthSessionProvider>
      <FeatureSettingsProvider>
        <NotificationsStateProvider>
          <RouterProvider router={router} />
        </NotificationsStateProvider>
      </FeatureSettingsProvider>
    </AuthSessionProvider>
  );
}
