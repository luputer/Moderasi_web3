import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor } from '@dfinity/agent';

import {
  idlFactory as backend_idl,
  canisterId as backend_id,
} from 'declarations/moderasi_papan_backend';

const identityProvider =
  process.env.DFX_NETWORK === 'ic'
    ? 'https://identity.ic0.app'
    : 'http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943/';

function App() {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState('');
  const [backendActor, setBackendActor] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);
  const [posts, setPosts] = useState([]);

  // 🔐 Create and reuse agent + actor when logged in
  useEffect(() => {
    AuthClient.create().then((client) => {
      setAuthClient(client);
      client.isAuthenticated().then(async (loggedIn) => {
        setIsAuthenticated(loggedIn);
        if (loggedIn) {
          const identity = client.getIdentity();
          const principalId = identity.getPrincipal().toText();
          setPrincipal(principalId);

          const agent = new HttpAgent({ identity });
          if (process.env.DFX_NETWORK !== 'ic') {
            await agent.fetchRootKey();
          }

          const actor = Actor.createActor(backend_idl, {
            agent,
            canisterId: backend_id,
          });

          setBackendActor(actor);
          loadPosts(actor);
        }
      });
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

        const agent = new HttpAgent({ identity });
        if (process.env.DFX_NETWORK !== 'ic') {
          await agent.fetchRootKey();
        }

        const actor = Actor.createActor(backend_idl, {
          agent,
          canisterId: backend_id,
        });

        setBackendActor(actor);
        loadPosts(actor);
      },
    });
  };

  const logout = async () => {
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal('');
    setBackendActor(null);
    setSubmitStatus(null);
    setPostContent('');
    setPosts([]);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!backendActor) {
      setSubmitStatus('❌ Harap login terlebih dahulu.');
      return;
    }

    try {
      const postId = await backendActor.addPost(postContent);
      setSubmitStatus(`✅ Post berhasil ditambahkan! ID: ${postId}`);
      setPostContent('');
      loadPosts();
    } catch (err) {
      console.error(err);
      setSubmitStatus('❌ Gagal mengirim post.');
    }
  };

  const handleDelete = async (id) => {
    if (!backendActor) return;
    try {
      const success = await backendActor.deletePost(id);
      if (success) {
        setPosts((prev) => prev.filter((p) => Number(p.id) !== Number(id)));
      }
    } catch (err) {
      console.error('Gagal menghapus post:', err);
    }
  };

  const loadPosts = async (actorInstance = backendActor) => {
    if (!actorInstance) return;
    try {
      const data = await actorInstance.getPosts();
      const sorted = data.sort((a, b) => Number(b.id) - Number(a.id));
      setPosts(sorted);
    } catch (err) {
      console.error('Gagal memuat postingan:', err);
    }
  };

  return (
    <main
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: 'auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ color: '#4f46e5' }}>🔐 Internet Identity</h1>

      {!isAuthenticated ? (
        <button
          onClick={login}
          style={{
            padding: '0.5rem 1rem',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Login dengan Internet Identity
        </button>
      ) : (
        <>
          <p>
            <strong>Principal:</strong> {principal}
          </p>
          <button
            onClick={logout}
            style={{
              marginBottom: '1rem',
              padding: '0.4rem 1rem',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>

          <form onSubmit={handleSubmitPost}>
            <h3>Tulis Post Baru</h3>
            <textarea
              rows="4"
              cols="60"
              placeholder="Apa yang ingin kamu bagikan?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                width: '100%',
              }}
            />
            <br />
            <button
              type="submit"
              style={{
                marginTop: '0.5rem',
                padding: '0.4rem 1rem',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Kirim Post
            </button>
            {submitStatus && (
              <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                {submitStatus}
              </p>
            )}
          </form>

          <h3 style={{ marginTop: '2rem' }}>📋 Daftar Post</h3>
          {posts.length === 0 ? (
            <p>Belum ada postingan.</p>
          ) : (
            posts.map((post) => (
              <div
                key={Number(post.id)}
                style={{
                  background: '#fff',
                  padding: '1rem',
                  marginTop: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <p>
                  <strong>ID:</strong> {post.id.toString()}
                </p>
                <p>
                  <strong>Author:</strong> {post.author.toText()}
                </p>
                <p>
                  <strong>Content:</strong> {post.content}
                </p>
                <p>
                  <strong>Votes:</strong> {post.votes.toString()}
                </p>
                {post.author.toText() === principal && (
                  <button
                    onClick={() => handleDelete(Number(post.id))}
                    style={{
                      marginTop: '0.5rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    🗑️ Hapus Post
                  </button>
                )}
              </div>
            ))
          )}
        </>
      )}
    </main>
  );
}

export default App;