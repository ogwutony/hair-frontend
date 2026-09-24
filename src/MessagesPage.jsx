// src/pages/MessagesPage.jsx
// Direct messages: inbox on the left, conversation on the right (one pane at a time on phones).
// Open a conversation with someone via /messages?with=<email>&name=<display name>.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../utils/useIsMobile';
import { useModeration } from '../utils/moderation';
import {
  countUnreadThreads, fetchInbox, fetchThread, formatMessageTime, isThreadUnread, markThreadSeen, sendMessage,
} from '../utils/messages';

const Avatar = ({ url, name, size = 44 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: '#eee', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      : <span style={{ fontWeight: 700, color: '#555', fontSize: size * 0.38 }}>{(name || '?').trim()[0]?.toUpperCase() || '?'}</span>}
  </div>
);

const displayNameFor = (value) => {
  if (!value) return 'User';
  return value.includes('@') ? value.split('@')[0] : value;
};

export const MessagesPage = ({ authToken, userEmail, onUnreadChange }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isBlocked } = useModeration();

  const [threads, setThreads] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [inboxError, setInboxError] = useState('');
  const [active, setActive] = useState(null); // { key, name, avatar, threadId }
  const [messages, setMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // ── Inbox ──────────────────────────────────────────────────────────────────
  const loadInbox = useCallback(async () => {
    if (!authToken) return;
    try {
      const list = await fetchInbox(authToken);
      setThreads(list);
      setInboxError('');
      if (onUnreadChange) onUnreadChange(countUnreadThreads(list));
    } catch (e) {
      setInboxError(e.message);
    } finally {
      setInboxLoading(false);
    }
  }, [authToken, onUnreadChange]);

  useEffect(() => {
    loadInbox();
    const t = setInterval(loadInbox, 30000);
    return () => clearInterval(t);
  }, [loadInbox]);

  // ── Open a conversation from the URL (?with=email&name=Name) ───────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const withUser = params.get('with');
    if (!withUser) return;
    setActive((prev) => (prev && prev.key === withUser ? prev : {
      key: withUser,
      name: params.get('name') || displayNameFor(withUser),
      avatar: null,
      threadId: null,
      email: withUser.includes('@') ? withUser : null,
    }));
  }, [location.search]);

  // ── Messages in the open conversation ──────────────────────────────────────
  const loadThread = useCallback(async (silent = false) => {
    if (!authToken || !active) return;
    if (!silent) { setThreadLoading(true); setThreadError(''); }
    try {
      const list = await fetchThread(authToken, active.key);
      setMessages(list);
      // Learn the other person's email from the thread so Report/Block and the URL work
      const theirs = list.find((m) => m.fromUserEmail && m.fromUserEmail.toLowerCase() !== String(userEmail).toLowerCase());
      const mine = list.find((m) => m.toUserEmail && m.fromUserEmail?.toLowerCase() === String(userEmail).toLowerCase());
      const otherEmail = theirs?.fromUserEmail || mine?.toUserEmail;
      if (otherEmail && !active.email) setActive((prev) => (prev ? { ...prev, email: otherEmail } : prev));
    } catch (e) {
      if (!silent) setThreadError(e.message);
    } finally {
      if (!silent) setThreadLoading(false);
    }
  }, [authToken, active, userEmail]);

  useEffect(() => {
    if (!active) return undefined;
    setMessages([]);
    loadThread(false);
    const t = setInterval(() => loadThread(true), 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.key]);

  // Mark as seen once the conversation is open
  useEffect(() => {
    if (!active) return;
    const thread = threads.find((t) => String(t.id) === String(active.threadId) || String(t.otherUserId) === String(active.key))
      || threads.find((t) => active.name && t.otherUserName && t.otherUserName.toLowerCase() === String(active.name).toLowerCase());
    if (thread) {
      markThreadSeen(thread.id, thread.lastMessageAt);
      if (onUnreadChange) onUnreadChange(countUnreadThreads(threads));
    }
  }, [active, threads, messages.length, onUnreadChange]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ block: 'end' });
  }, [messages.length, active?.key]);

  const openThread = (t) => {
    setActive({ key: String(t.otherUserId), name: t.otherUserName, avatar: t.otherUserAvatar, threadId: t.id, email: null });
    markThreadSeen(t.id, t.lastMessageAt);
    if (location.search) navigate('/messages', { replace: true });
  };

  const closeThread = () => {
    setActive(null);
    setMessages([]);
    if (location.search) navigate('/messages', { replace: true });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !active || sending) return;
    setSending(true);
    setThreadError('');
    try {
      const msg = await sendMessage(authToken, active.email || active.key, text);
      setMessages((prev) => [...prev, msg]);
      setDraft('');
      if (!active.email && msg.toUserEmail) setActive((prev) => ({ ...prev, email: msg.toUserEmail }));
      loadInbox();
    } catch (err) {
      setThreadError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!authToken) {
    return (
      <div style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2>Messages</h2>
        <p style={{ color: '#666' }}>Log in to send and read direct messages.</p>
        <Link to="/login" style={{ display: 'inline-block', background: '#222', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
      </div>
    );
  }

  const blockedActive = active?.email && isBlocked(active.email);
  const showList = !isMobile || !active;
  const showThread = !isMobile || !!active;

  // ── Inbox list ─────────────────────────────────────────────────────────────
  const inbox = (
    <div style={{ borderRight: isMobile ? 'none' : '1px solid #eee', width: isMobile ? '100%' : '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid #eee' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>Messages</h2>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>Message people you follow, your followers, or anyone from their Perspectives page.</p>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {inboxLoading ? <p style={{ padding: '16px', color: '#888', fontSize: '14px' }}>Loading…</p>
          : inboxError ? <p style={{ padding: '16px', color: '#c0392b', fontSize: '14px' }}>{inboxError}</p>
          : threads.length === 0 ? (
            <div style={{ padding: '24px 16px', color: '#888', fontSize: '14px', lineHeight: 1.5 }}>
              No conversations yet. Tap <strong>Message</strong> on someone in your <Link to="/perspectives">Perspectives</Link> to start one.
            </div>
          ) : threads.map((t) => {
            const unread = isThreadUnread(t);
            const selected = active && (String(active.threadId) === String(t.id) || String(active.key) === String(t.otherUserId));
            return (
              <button key={t.id} type="button" onClick={() => openThread(t)}
                style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', padding: '12px 16px', border: 'none', borderBottom: '1px solid #f3f3f3', background: selected ? '#f5f5f5' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <Avatar url={t.otherUserAvatar} name={t.otherUserName} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontWeight: unread ? 800 : 600, fontSize: '14px', color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayNameFor(t.otherUserName)}</span>
                    <span style={{ fontSize: '11px', color: '#999', flexShrink: 0 }}>{formatMessageTime(t.lastMessageAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: unread ? '#222' : '#888', fontWeight: unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.lastMessage || 'Say hello'}</span>
                    {unread && <span aria-label="Unread" style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0a84ff', flexShrink: 0 }} />}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );

  // ── Conversation ───────────────────────────────────────────────────────────
  const conversation = !active ? (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '14px', padding: '24px', textAlign: 'center' }}>
      Select a conversation to start messaging.
    </div>
  ) : (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        {isMobile && (
          <button type="button" onClick={closeThread} aria-label="Back to messages" style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer', padding: '0 6px 0 0' }}>‹</button>
        )}
        <Avatar url={active.avatar} name={active.name} size={36} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayNameFor(active.name)}</div>
          {active.email && (
            <Link to={`/perspectives?person=${encodeURIComponent(active.email)}`} style={{ fontSize: '12px', color: '#888' }}>View Perspectives</Link>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fafafa' }}>
        {threadLoading ? <p style={{ color: '#888', fontSize: '14px' }}>Loading…</p>
          : messages.length === 0 ? <p style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '30px' }}>No messages yet. Say hello 👋</p>
          : messages.map((m, i) => {
            const mine = String(m.fromUserEmail || '').toLowerCase() === String(userEmail || '').toLowerCase();
            const prev = messages[i - 1];
            const showTime = !prev || new Date(m.createdAt) - new Date(prev.createdAt) > 15 * 60000;
            return (
              <React.Fragment key={m.id || i}>
                {showTime && <div style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', margin: '6px 0' }}>{formatMessageTime(m.createdAt)}</div>}
                <div style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '75%', background: mine ? '#222' : '#fff', color: mine ? '#fff' : '#222', border: mine ? 'none' : '1px solid #e8e8e8', padding: '9px 13px', borderRadius: '18px', borderBottomRightRadius: mine ? '4px' : '18px', borderBottomLeftRadius: mine ? '18px' : '4px', fontSize: '14px', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {m.text}
                </div>
              </React.Fragment>
            );
          })}
        <div ref={bottomRef} />
      </div>

      {threadError && <div style={{ padding: '8px 16px', color: '#c0392b', fontSize: '13px', background: '#fff5f5' }}>{threadError}</div>}
      {blockedActive ? (
        <div style={{ padding: '14px 16px', borderTop: '1px solid #eee', fontSize: '13px', color: '#888', textAlign: 'center' }}>
          You blocked this person. Unblock them from your <Link to="/profile">Profile</Link> to message them.
        </div>
      ) : (
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid #eee', background: '#fff' }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${displayNameFor(active.name)}…`} maxLength={2000}
            style={{ flex: 1, padding: '11px 14px', borderRadius: '22px', border: '1px solid #ddd', fontSize: '14px', minWidth: 0 }} />
          <button type="submit" disabled={!draft.trim() || sending}
            style={{ border: 'none', background: '#222', color: '#fff', borderRadius: '22px', padding: '0 18px', fontWeight: 700, cursor: draft.trim() ? 'pointer' : 'default', opacity: !draft.trim() || sending ? 0.5 : 1 }}>
            {sending ? '…' : 'Send'}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: isMobile ? '0' : '24px auto', padding: isMobile ? 0 : '0 16px' }}>
      <Helmet><title>Messages | The Majorities</title><meta name="robots" content="noindex" /></Helmet>
      <div style={{ display: 'flex', height: isMobile ? 'calc(100vh - 150px)' : '640px', border: isMobile ? 'none' : '1px solid #eee', borderRadius: isMobile ? 0 : '16px', overflow: 'hidden', background: '#fff' }}>
        {showList && inbox}
        {showThread && conversation}
      </div>
    </div>
  );
};
