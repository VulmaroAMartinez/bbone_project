import { Providers } from '@/components/providers';
import { AppRouter } from '@/router/router';

function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}

export default App;
