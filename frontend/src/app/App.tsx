import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthSessionProvider } from './services/authSession';
import { FeatureSettingsProvider } from './services/featureSettings';

export default function App() {
  return (
    <AuthSessionProvider>
      <FeatureSettingsProvider>
        <RouterProvider router={router} />
      </FeatureSettingsProvider>
    </AuthSessionProvider>
  );
}
