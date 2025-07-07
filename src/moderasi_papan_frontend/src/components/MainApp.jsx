import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor } from '@dfinity/agent';
import sha256 from 'crypto-js/sha256';
import { LogIn, LogOut, ThumbsUp, Trash2, User, Send, ListTodo } from 'lucide-react';
import Swal from 'sweetalert2';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [postContent, setPostContent] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);
  const [posts, setPosts] = useState([]);
  const [registerMode, setRegisterMode] = useState(false);

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

          // Optionally fetch username
          const res = await actor.getUsername(identity.getPrincipal());
          if (res.length > 0) setUsername(res[0]);
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

        // Optionally fetch username
        const res = await actor.getUsername(identity.getPrincipal());
        if (res.length > 0) setUsername(res[0]);
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
    setUsername('');
    setPassword('');
  };

  const handleRegister = async () => {
    if (!backendActor) return;

    const { value: formValues } = await Swal.fire({
      title: 'Daftar atau Ganti Username',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Username">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Password" type="password">',
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value
        ];
      }
    });

    if (formValues) {
      const [newUsername, newPassword] = formValues;
      if (newUsername && newPassword) {
        const passwordHash = sha256(newPassword).toString();
        const ok = await backendActor.register(newUsername, passwordHash);
        if (ok) {
          Swal.fire('Berhasil!', 'Username berhasil didaftarkan.', 'success');
          setUsername(newUsername);
        } else {
          Swal.fire('Gagal!', 'Gagal mendaftar username.', 'error');
        }
      } else {
        Swal.fire('Gagal!', 'Username dan password tidak boleh kosong.', 'error');
      }
    }
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

  const handleVote = async (id) => {
    if (!backendActor) return;
    try {
      const success = await backendActor.votePost(id);
      if (success) {
        loadPosts();
      } else {
        Swal.fire('Gagal!', 'Anda sudah pernah vote post ini.', 'error');
      }
    } catch (err) {
      console.error('Gagal vote:', err);
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
    <main className="main-app-container">
      <h1 className="main-app-title">🔐 Internet Identity + Username</h1>

      {!isAuthenticated ? (
        <button onClick={login} className="btn primary-btn">
          <LogIn size={20} style={{ marginRight: '8px' }} /> Login dengan Internet Identity
        </button>
      ) : (
        <>
          <p>
            <strong>Principal:</strong> {principal}
          </p>
          <button onClick={logout} className="btn danger-btn logout-btn">
            <LogOut size={20} style={{ marginRight: '8px' }} /> Logout
          </button>

          <p>
              <strong>Username:</strong> {username}{' '}
              <button onClick={handleRegister} className="btn secondary-btn username-btn"><User size={16} style={{ marginRight: '4px' }} /> Ubah</button>
            </p>

          <form onSubmit={handleSubmitPost} className="post-form">
            <h3>Tulis Post Baru</h3>
            <textarea
              rows="4"
              cols="60"
              placeholder="Apa yang ingin kamu bagikan?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
              className="post-textarea"
            />
            <br />
            <button type="submit" className="btn success-btn submit-post-btn">
              <Send size={20} style={{ marginRight: '8px' }} /> Kirim Post
            </button>
            
            {submitStatus && (
              <p className="submit-status">
                {submitStatus}
              </p>
            )}
          </form>

          <h3 className="posts-list-title"><ListTodo size={24} style={{ marginRight: '8px' }} /> Daftar Post</h3>
          {posts.length === 0 ? (
            <p>Belum ada postingan.</p>
          ) : (
            posts.map((post) => (
              <div key={Number(post.id)} className="post-item">
                <p>
                  <strong>ID:</strong> {post.id.toString()}
                </p>
                <p>
                  <strong>Author:</strong> {post.username} ({post.author.toText()})
                </p>
                <p>
                  <strong>Content:</strong> {post.content}
                </p>
                <p>
                  <strong>Votes:</strong> {post.votes.toString()}
                </p>

                <button onClick={() => handleVote(Number(post.id))} className="btn vote-btn">
                  <ThumbsUp size={16} style={{ marginRight: '4px' }} /> Vote
                </button>

                {post.author.toText() === principal && (
                  <button onClick={() => handleDelete(Number(post.id))} className="btn delete-btn">
                    <Trash2 size={16} style={{ marginRight: '4px' }} /> Hapus Post
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