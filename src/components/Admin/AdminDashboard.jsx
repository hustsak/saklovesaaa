import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, LogOut, Image, Film, FileText, Check } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import { clearAdminSession } from '../../utils/storage';

export default function AdminDashboard({
  memories,
  onSaveMemories,
  letters,
  onSaveLetters,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('memories');
  const [editingMemory, setEditingMemory] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Form State for Memory
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('2026-09-08');
  const [formDisplayDate, setFormDisplayDate] = useState('09.08.2026');
  const [formTime, setFormTime] = useState('14:32');
  const [formLocation, setFormLocation] = useState('Phnom Penh');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formHandwritten, setFormHandwritten] = useState('');
  const [formCategory, setFormCategory] = useState('Celebrations');

  const handleStartNew = () => {
    sound.playTapeClick();
    setIsCreatingNew(true);
    setEditingMemory(null);
    setFormTitle('Sunset Walk by the Riverside');
    setFormDate('2026-09-08');
    setFormDisplayDate('09.08.2026');
    setFormTime('17:45');
    setFormLocation('Phnom Penh');
    setFormImageUrl('https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80');
    setFormCaption('Holding hands under the golden twilight sky in Phnom Penh.');
    setFormHandwritten('“our favorite walk together.”');
    setFormCategory('Celebrations');
  };

  const handleEdit = (mem) => {
    sound.playTapeClick();
    setIsCreatingNew(false);
    setEditingMemory(mem);
    setFormTitle(mem.title);
    setFormDate(mem.date || '2026-09-08');
    setFormDisplayDate(mem.displayDate || '09.08.2026');
    setFormTime(mem.time || '14:32');
    setFormLocation(mem.location || 'Phnom Penh');
    setFormImageUrl(mem.imageUrl);
    setFormCaption(mem.caption || mem.journalEntry);
    setFormHandwritten(mem.handwrittenNote || '');
    setFormCategory(mem.category || 'Firsts');
  };

  const handleDelete = (id) => {
    sound.playTapeClick();
    if (window.confirm('Delete this memory from the digital archive?')) {
      const updated = memories.filter((m) => m.id !== id);
      onSaveMemories(updated);
    }
  };

  const handleSaveMemoryForm = (e) => {
    e.preventDefault();
    sound.playTapeClick();

    if (isCreatingNew) {
      const newEntry = {
        id: `mem-${Date.now()}`,
        title: formTitle,
        date: formDate,
        displayDate: formDisplayDate,
        time: formTime,
        location: formLocation,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
        caption: formCaption,
        journalEntry: formCaption,
        handwrittenNote: formHandwritten,
        category: formCategory,
        isFavorite: false,
        cameraSettings: 'F/2.0 • 1/125s • ISO 200'
      };
      onSaveMemories([newEntry, ...memories]);
    } else if (editingMemory) {
      const updated = memories.map((m) => {
        if (m.id === editingMemory.id) {
          return {
            ...m,
            title: formTitle,
            date: formDate,
            displayDate: formDisplayDate,
            time: formTime,
            location: formLocation,
            imageUrl: formImageUrl,
            caption: formCaption,
            journalEntry: formCaption,
            handwrittenNote: formHandwritten,
            category: formCategory
          };
        }
        return m;
      });
      onSaveMemories(updated);
    }

    setEditingMemory(null);
    setIsCreatingNew(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleLogout = () => {
    sound.playKeyClick();
    clearAdminSession();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 14, 13, 0.92)',
        backdropFilter: 'blur(10px)',
        zIndex: 970,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 12px'
      }}
    >
      <div
        className="os-window"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Title Bar */}
        <div className="os-window-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔒 ADMIN CONTROL CONSOLE &bull; MEMORY ARCHIVE v2.6</span>
          </div>
          <div className="os-window-controls">
            <button
              className="os-control-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={11} />
            </button>
            <button
              className="os-control-btn"
              onClick={onClose}
              title="Close Console"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Console Action Bar */}
        <div
          style={{
            background: 'var(--retro-charcoal)',
            color: 'var(--retro-cream)',
            padding: '12px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            borderBottom: '2px solid var(--retro-border-dark)'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="tape-btn"
              onClick={handleStartNew}
              style={{ background: 'var(--retro-burgundy)', color: '#FFF' }}
            >
              <Plus size={13} style={{ verticalAlign: 'middle' }} /> NEW MEMORY
            </button>
            <button
              className="tape-btn"
              onClick={handleStartNew}
            >
              <Image size={13} style={{ verticalAlign: 'middle' }} /> + PHOTO
            </button>
            <button
              className="tape-btn"
              onClick={() => alert('Video capture format queued for next film roll.')}
            >
              <Film size={13} style={{ verticalAlign: 'middle' }} /> + VIDEO
            </button>
          </div>

          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.1rem', color: 'var(--retro-champagne)' }}>
            STATUS: AUTHENTICATED [VIRAKSAK &amp; CHANREAKSA]
          </div>
        </div>

        {/* Main Body */}
        <div
          className="os-window-body"
          style={{
            background: 'var(--retro-cream)',
            overflowY: 'auto',
            padding: '20px'
          }}
        >
          {saveToast && (
            <div
              style={{
                background: 'var(--retro-olive)',
                color: '#FFF',
                padding: '8px 14px',
                borderRadius: '3px',
                marginBottom: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Check size={16} /> ARCHIVE COMMITTED TO LOCAL PERSISTENCE &amp; FIREBASE REPOSITORY
            </div>
          )}

          {/* Form Modal / Drawer if Editing or Creating */}
          {(isCreatingNew || editingMemory) ? (
            <form
              onSubmit={handleSaveMemoryForm}
              style={{
                background: 'var(--retro-offwhite)',
                border: '2px solid var(--retro-charcoal)',
                borderRadius: '4px',
                padding: '20px',
                marginBottom: '24px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  borderBottom: '1px solid var(--retro-border)',
                  paddingBottom: '8px'
                }}
              >
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>
                  {isCreatingNew ? 'Create New Archive Entry' : `Editing: ${editingMemory?.title}`}
                </h4>
                <button
                  type="button"
                  className="os-control-btn"
                  onClick={() => {
                    setEditingMemory(null);
                    setIsCreatingNew(false);
                  }}
                >
                  <X size={12} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                    MEMORY TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--retro-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                    DATE (DISPLAY)
                  </label>
                  <input
                    type="text"
                    required
                    value={formDisplayDate}
                    onChange={(e) => setFormDisplayDate(e.target.value)}
                    placeholder="09.08.2026"
                    style={{ width: '100%', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--retro-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                    TIME
                  </label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="14:32"
                    style={{ width: '100%', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--retro-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                    LOCATION
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Phnom Penh"
                    style={{ width: '100%', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--retro-border)' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                    IMAGE (PHOTO)
                  </label>
                  <label
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      color: 'var(--retro-burgundy)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Image size={12} />
                    <span>[ 📸 UPLOAD FROM PHONE ]</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          sound.playShutterSound();
                          try {
                            const { uploadImageWithFallback } = await import('../../utils/imageUploader');
                            const url = await uploadImageWithFallback(file);
                            setFormImageUrl(url);
                          } catch (err) {
                            console.error('Phone upload error:', err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Paste image URL or tap Upload from Phone above"
                  style={{ width: '100%', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--retro-border)' }}
                />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                  HANDWRITTEN NOTE CAPTION
                </label>
                <input
                  type="text"
                  value={formHandwritten}
                  onChange={(e) => setFormHandwritten(e.target.value)}
                  placeholder="“one of my favorite memories.”"
                  style={{ width: '100%', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--retro-border)' }}
                />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                  DIARY / JOURNAL NARRATIVE
                </label>
                <textarea
                  rows={3}
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--retro-border)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="tape-btn"
                  onClick={() => {
                    setEditingMemory(null);
                    setIsCreatingNew(false);
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="tape-btn"
                  style={{ background: 'var(--retro-burgundy)', color: '#FFF' }}
                >
                  <Save size={13} style={{ verticalAlign: 'middle' }} /> SAVE ARCHIVE ENTRY
                </button>
              </div>
            </form>
          ) : null}

          {/* Memories Table View */}
          <div style={{ border: '1.5px solid var(--retro-border)', borderRadius: '3px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--retro-cream-dark)', borderBottom: '1.5px solid var(--retro-border)' }}>
                  <th style={{ padding: '8px 12px' }}>THUMB</th>
                  <th style={{ padding: '8px 12px' }}>TITLE</th>
                  <th style={{ padding: '8px 12px' }}>DATE / TIME</th>
                  <th style={{ padding: '8px 12px' }}>LOCATION</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {memories.map((mem) => (
                  <tr key={mem.id} style={{ borderBottom: '1px solid var(--retro-border)', background: 'var(--retro-offwhite)' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <img
                        src={mem.imageUrl}
                        alt=""
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--retro-charcoal)' }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--retro-charcoal)' }}>
                      {mem.title}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--retro-brown)' }}>
                      {mem.displayDate} {mem.time}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {mem.location}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="nav-icon-toggle"
                          style={{ width: '26px', height: '26px' }}
                          title="Edit Memory"
                          onClick={() => handleEdit(mem)}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          className="nav-icon-toggle"
                          style={{ width: '26px', height: '26px', color: 'var(--retro-faded-red)' }}
                          title="Delete Memory"
                          onClick={() => handleDelete(mem.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
