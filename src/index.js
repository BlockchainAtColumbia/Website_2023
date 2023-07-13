import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PrivyProvider } from '@privy-io/react-auth';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID}
      config={{
        // Configure your app's login methods
        loginMethods: ['wallet', 'email', 'google', 'twitter', 'discord', 'github'],
        // Configure your app's branding and UIs
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://ledgerfest.info/img/organizers/batc-logo.png",
          showWalletLoginFirst: false
        },
        
        // Configure your app's legal policies
        legal: {
          termsAndConditionsUrl: 'https://your-terms-and-conditions-url',
          privacyPolicyUrl: 'https://your-privacy-policy-url'
        },
        // Any new wallet created with this config will automatically prompt wallet creation for users without wallets.
        embeddedWallets: {
          createOnLogin: 'users-without-wallets' // defaults to 'off'
        }
      }}
      onSuccess={(user) => console.log(`User ${user.id} logged in!`)}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
