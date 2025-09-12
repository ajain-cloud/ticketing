// This is the custom App component in Next.js (used in the Pages Router).
// It loads Bootstrap's global CSS once and ensures every page (Component)
// is rendered with its corresponding props (pageProps).
import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// In Next.js, `Component` is automatically provided to _app.tsx by the framework.
// It represents the active page being rendered, so we don’t manually pass it in.
const AppComponent = ({ Component, pageProps, currentUser }) => {
  console.log('Starting the component....');

  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

// This is for the headers to be shown in pages
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    // If the page being rendered has its own getInitialProps,
    // call it manually here from the custom App component.
    // This ensures that page-level data fetching still runs
    // even though we overrode the default App behavior.
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
