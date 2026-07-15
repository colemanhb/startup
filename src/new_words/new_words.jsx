import React from 'react';

import { Unauthenticated } from './unauthenticated';
import { Authenticated } from './authenticated';
import { AuthState } from '../login/authState';

export function NewWords({username, authState}) {
  return (
    <main className='new-words'>
      {authState === AuthState.Authenticated ? (
        <Authenticated/>
      ) : (
        <Unauthenticated/>
      )}
    </main>
  );
}
