import React from 'react';
import {Navigate} from 'react-router-dom';

import { Unauthenticated } from './unauthenticated';
import { Authenticated } from './authenticated';
import { AuthState } from './authState';

export function Login({ username, authState, onAuthChange }) {
  const [justLoggedIn, setJustLoggedIn] = React.useState(false);

  if (justLoggedIn && authState === AuthState.Authenticated) {
    return <Navigate to="/languages" push />;
  }
  return (
    <main className='login'>
      <div>
        {authState !== AuthState.Unknown && <h1>Welcome to LibreBoox</h1>}
        {authState === AuthState.Authenticated && (
          <Authenticated 
          username={username} 
          onLogout={() => {
            setJustLoggedIn(false);
            onAuthChange(username, AuthState.Unauthenticated);
          }} />
        )}
        {authState === AuthState.Unauthenticated && (
          <Unauthenticated
            username={username}
            onLogin={(loginUsername) => {
              setJustLoggedIn(true);
              onAuthChange(loginUsername, AuthState.Authenticated);
            }}
          />
        )}
      </div>
    </main>
  );
}
