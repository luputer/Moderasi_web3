import React, { useState, useEffect } from 'react';

import { AuthClient } from '@dfinity/auth-client';
import { moderasi_papan_backend } from 'declarations/moderasi_papan_backend';



const identityProvider =

  process.env.DFX_NETWORK === 'ic'

    ? 'https://identity.ic0.app'
    : 'http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943/';



function App() {

  const [authClient, setAuthClient] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [principal, setPrincipal] = useState('');



  useEffect(() => {

    AuthClient.create().then((client) => {

      setAuthClient(client);

      client.isAuthenticated().then(setIsAuthenticated);

    });

  }, []);



  const login = async () => {

    await authClient.login({

      identityProvider,

      onSuccess: async () => {

        setIsAuthenticated(true);

        const identity = authClient.getIdentity();

        const principalId = identity.getPrincipal().toText();

        setPrincipal(principalId);

      },

    });

  };


  const logout = async () => {

    await authClient.logout();

    setIsAuthenticated(false);

    setPrincipal('');

  };



  return (

    <main>

      <h1>Login Internet Identity</h1>

      {!isAuthenticated ? (

        <button onClick={login}>Login with Internet Ident

          ity</button>

      ) : (

        <>

          <div>

            <strong>Principal:</strong> {principal}

          </div>

          <button onClick={logout}>Logout</button>

        </>

      )}

    </main>

  );

}



export default App;
