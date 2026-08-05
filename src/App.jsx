import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Trash2, ShoppingBag, ListPlus, Check, Lock, LockOpen,
  Apple, Milk, Package, Sparkles, X, Pencil, AlertTriangle,
  ChevronDown, ChevronUp, Droplets, Wheat, Beef, Coffee, 
  ShoppingCart, RotateCcw
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────── */
const CATEGORIES = [
  { id: 'fruits', name: 'Fruits & Légumes', icon: Apple,    color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'frais',  name: 'Frais',           icon: Droplets, color: 'text-sky-600',     bg: 'bg-sky-50',      border: 'border-sky-100',     badge: 'bg-sky-100 text-sky-700'     },
  { id: 'viande', name: 'Viandes & Poissons', icon: Beef,  color: 'text-rose-600',   bg: 'bg-rose-50',     border: 'border-rose-100',    badge: 'bg-rose-100 text-rose-700'   },
  { id: 'epice',  name: 'Épicerie',         icon: Wheat,   color: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-100',   badge: 'bg-amber-100 text-amber-700' },
  { id: 'boiss',  name: 'Boissons',         icon: Coffee,  color: 'text-brown-600',   bg: 'bg-orange-50',   border: 'border-orange-100',  badge: 'bg-orange-100 text-orange-700'},
  { id: 'hygiene',name: 'Hygiène',          icon: Sparkles,color: 'text-violet-600',  bg: 'bg-violet-50',   border: 'border-violet-100',  badge: 'bg-violet-100 text-violet-700'},
  { id: 'autre',  name: 'Autre',            icon: Package, color: 'text-slate-600',   bg: 'bg-slate-50',    border: 'border-slate-100',   badge: 'bg-slate-100 text-slate-600' },
];

const UNITS = ['unité', 'kg', 'g', 'L', 'cL', 'sachet', 'boîte', 'bouteille', 'barquette'];

/* ─── localStorage helper ───────────────────────────── */
function loadItems() {
  try {
    const raw = localStorage.getItem('shopping-list-items-v2');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ─── Confirm Modal ─────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-scale-in">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-base font-semibold text-slate-800 leading-snug">{message}</p>
          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-2xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Modal ─────────────────────────────────────── */
function EditModal({ item, onSave, onClose }) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [quantity, setQuantity] = useState(item.quantity);
  const [unit, setUnit] = useState(item.unit || 'unité');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ ...item, name: name.trim(), category, quantity: Number(quantity) || 1, unit });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-base">Modifier l'article</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nom de l'article"
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-24 px-3 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
            />
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className="flex-1 px-3 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-colors text-sm"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Progress Bar ──────────────────────────────────── */
function ProgressBar({ total, done }) {
  if (total === 0) return null;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500">{done} sur {total} articles</span>
        <span className={pct === 100 ? 'text-emerald-600' : 'text-slate-400'}>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${pct === 100 ? 'progress-shimmer' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Wake Lock indicator ───────────────────────────── */
function WakeLockBadge({ active }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
      active
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-slate-50 border-slate-200 text-slate-400'
    }`}>
      {active ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
      {active ? 'Écran maintenu' : 'Veille non bloquée'}
    </div>
  );
}

/* ─── Main App ──────────────────────────────────────── */
export default function App() {
  const [items, setItems] = useState(loadItems);
  const [mode, setMode] = useState('preparation');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('unité');

  // UI state
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }
  const [editItem, setEditItem] = useState(null);
  const [collapsedCats, setCollapsedCats] = useState({});
  const [newItemId, setNewItemId] = useState(null);

  const wakeLockRef = useRef(null);
  const nameInputRef = useRef(null);

  /* ── Persist ── */
  useEffect(() => {
    localStorage.setItem('shopping-list-items-v2', JSON.stringify(items));
  }, [items]);

  /* ── Wake Lock ── */
  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setWakeLockActive(true);
      wakeLockRef.current.addEventListener('release', () => setWakeLockActive(false), { once: true });
    } catch (err) {
      console.warn('Wake Lock:', err.message);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (mode === 'courses') {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => { releaseWakeLock(); };
  }, [mode, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && mode === 'courses' && !wakeLockRef.current) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [mode, requestWakeLock]);

  /* ── Item actions ── */
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = crypto.randomUUID();
    const newItem = {
      id,
      name: name.trim(),
      category,
      quantity: parseFloat(quantity) || 1,
      unit,
      inCart: false,
    };
    setItems(prev => [newItem, ...prev]);
    setNewItemId(id);
    setTimeout(() => setNewItemId(null), 600);
    setName('');
    setQuantity(1);
    nameInputRef.current?.focus();
  };

  const toggleInCart = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, inCart: !item.inCart } : item));
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const saveEdit = (updated) => {
    setItems(prev => prev.map(item => item.id === updated.id ? updated : item));
    setEditItem(null);
  };

  const confirmClearAll = () => {
    setConfirmModal({
      message: 'Réinitialiser toute la liste ?',
      onConfirm: () => { setItems([]); setConfirmModal(null); },
    });
  };

  const confirmClearCart = () => {
    setConfirmModal({
      message: 'Retirer tous les articles du caddie ?',
      onConfirm: () => {
        setItems(prev => prev.map(i => ({ ...i, inCart: false })));
        setConfirmModal(null);
      },
    });
  };

  const toggleCatCollapse = (catName) => {
    setCollapsedCats(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  /* ── Derived ── */
  const pendingItems = items.filter(i => !i.inCart);
  const cartItems   = items.filter(i => i.inCart);
  const total       = items.length;
  const done        = cartItems.length;

  const getCatMeta = (catName) => CATEGORIES.find(c => c.name === catName) || CATEGORIES[CATEGORIES.length - 1];

  /* ────────────────────────────────────────────── RENDER */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 safe-bottom select-none">

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="sticky top-0 safe-top z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-800 tracking-tight">Ma Liste</span>
            {total > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                {total}
              </span>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setMode('preparation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                mode === 'preparation'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              Saisie
            </button>
            <button
              onClick={() => setMode('courses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                mode === 'courses'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Courses
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────── */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-5">

        {/* ══ MODE PRÉPARATION ══════════════════════════ */}
        {mode === 'preparation' && (
          <>
            {/* Formulaire */}
            <form onSubmit={handleAddItem} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Ajouter un article…"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  required
                />
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-16 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-28 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button
                    type="submit"
                    className="w-10 h-10 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl flex items-center justify-center transition-all self-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Liste groupée par catégorie */}
            {items.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">La liste est vide</p>
                <p className="text-xs mt-1 text-slate-300">Commencez par ajouter un article</p>
              </div>
            ) : (
              <div className="space-y-3">
                {CATEGORIES.map(cat => {
                  const catItems = items.filter(i => i.category === cat.name);
                  if (catItems.length === 0) return null;
                  const Icon = cat.icon;
                  const collapsed = collapsedCats[cat.name];

                  return (
                    <div key={cat.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      {/* Category header */}
                      <button
                        onClick={() => toggleCatCollapse(cat.name)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-xl ${cat.bg} flex items-center justify-center`}>
                            <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{cat.name}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${cat.badge}`}>{catItems.length}</span>
                        </div>
                        {collapsed
                          ? <ChevronDown className="w-4 h-4 text-slate-400" />
                          : <ChevronUp className="w-4 h-4 text-slate-400" />
                        }
                      </button>

                      {/* Items */}
                      {!collapsed && (
                        <div className="border-t border-slate-50 divide-y divide-slate-50">
                          {catItems.map(item => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 px-4 py-3 group hover:bg-slate-50 transition-colors ${newItemId === item.id ? 'animate-slide-down' : ''}`}
                            >
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-sm text-slate-800 truncate block">{item.name}</span>
                                <span className="text-xs text-slate-400">{item.quantity} {item.unit || 'unité'}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditItem(item)}
                                  className="p-1.5 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="p-1.5 rounded-xl hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={confirmClearAll}
                  className="w-full py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-2xl border border-red-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Tout effacer
                </button>
              </div>
            )}
          </>
        )}

        {/* ══ MODE COURSES ══════════════════════════════ */}
        {mode === 'courses' && (
          <div className="space-y-5">
            {/* Status bar */}
            <div className="flex items-center justify-between">
              <WakeLockBadge active={wakeLockActive} />
              {cartItems.length > 0 && (
                <button
                  onClick={confirmClearCart}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Vider caddie
                </button>
              )}
            </div>

            {/* Progress */}
            {total > 0 && <ProgressBar total={total} done={done} />}

            {/* Pending items */}
            {pendingItems.length > 0 ? (
              <div className="space-y-4">
                {CATEGORIES.map(cat => {
                  const catItems = pendingItems.filter(i => i.category === cat.name);
                  if (catItems.length === 0) return null;
                  const Icon = cat.icon;

                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{cat.name}</span>
                      </div>
                      <div className="space-y-2">
                        {catItems.map(item => (
                          <button
                            key={item.id}
                            onClick={() => toggleInCart(item.id)}
                            className="tap-scale w-full bg-white px-5 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between text-left active:shadow-none"
                          >
                            <span className="text-lg font-bold text-slate-800 leading-tight">{item.name}</span>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              <span className={`${cat.badge} text-sm font-bold px-3 py-1 rounded-full`}>
                                {item.quantity} {item.unit || '×'}
                              </span>
                              <div className="w-7 h-7 rounded-full border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3.5 h-3.5 text-slate-300" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : total > 0 ? (
              /* All done */
              <div className="text-center py-14 bg-white rounded-3xl border border-slate-100 shadow-sm animate-scale-in">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-slate-800">Courses terminées !</p>
                <p className="text-sm text-slate-400 mt-1">{total} article{total > 1 ? 's' : ''} dans le caddie</p>
              </div>
            ) : (
              /* Empty list */
              <div className="text-center py-14 text-slate-300">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-slate-400">Aucun article</p>
                <p className="text-xs mt-1">Passez en mode Saisie pour préparer votre liste</p>
              </div>
            )}

            {/* Cart section */}
            {cartItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300 px-1 flex items-center gap-1.5">
                  <ShoppingCart className="w-3 h-3" />
                  Dans le caddie · {cartItems.length}
                </p>
                {cartItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleInCart(item.id)}
                    className="tap-scale w-full bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-100 flex items-center justify-between text-left opacity-60"
                  >
                    <span className="text-base font-semibold text-slate-400 line-through leading-tight">{item.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-xs text-slate-300 font-medium">{item.quantity} {item.unit || '×'}</span>
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODALS ─────────────────────────────────────── */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
      {editItem && (
        <EditModal
          item={editItem}
          onSave={saveEdit}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
