import { Providers } from '@/components/providers';
import { AppRouter } from '@/router/router';
import { PWAPrompt } from '@/components/layout/PWAPrompt';

function App() {
  return (
    <Providers>
      <AppRouter />
      <PWAPrompt />
    </Providers>
  );
}

export default App;
