import { FormEvent, useEffect, useState } from 'react';
import { Button, Field, TextArea, Checkbox, Modal, Spinner } from '../components/ui';
import { Food, searchFoods, upsertFood, deleteFood } from '../lib/admin';

const EMPTY: Partial<Food> = { name: '', category: 'General', serving_unit: 'serving', serving_size: 100, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, is_vegetarian: true, contains_egg: false, is_vegan: true, contains_dairy: false, contains_peanuts: false, contains_gluten: false, contains_soy: false, contains_seafood: false, description: '' };

export default function Foods() {
  const [items, setItems] = useState<Food[]>([]);
  const [term, setTerm] = useState('');
  const [editing, setEditing] = useState<Partial<Food> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (t = '') => {
    try {
      setLoading(true);
      setItems(await searchFoods(t));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!editing) return;
    try {
      await upsertFood(editing);
      setEditing(null);
      await load(term);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (f: Food) => {
    if (!window.confirm(`Delete "${f.name}"?`)) return;
    setError('');
    try {
      await deleteFood(f.id);
      await load(term);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const set = (patch: Partial<Food>) => setEditing((prev) => ({ ...(prev ?? EMPTY), ...patch }));

  return (
    <div>
      <div className="page-header">
        <div><h1>Foods</h1><p>{items.length} food items</p></div>
        <Button onClick={() => setEditing({ ...EMPTY })}>Add food</Button>
      </div>
      {error ? <div className="error-banner">{error}</div> : null}
      <div className="panel">
        <div className="panel-head">
          <h2>Food library</h2>
          <input
            className="input"
            placeholder="Search by name…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') load(term); }}
            style={{ width: 220 }}
          />
        </div>
        <div className="table-wrap">
          {loading ? (
            <div className="center-loading"><Spinner /></div>
          ) : items.length === 0 ? (
            <div className="empty">No foods found.</div>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Category</th><th>kcal</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Diet</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td><span className="pill">{f.category}</span></td>
                    <td>{f.calories}</td>
                    <td>{f.protein_g}g</td>
                    <td>{f.carbs_g}g</td>
                    <td>{f.fat_g}g</td>
                    <td>
                      {f.is_vegan ? <span className="pill ok">Vegan</span> : f.is_vegetarian ? <span className="pill ok">Veg</span> : <span className="pill">Non-veg</span>}
                    </td>
                    <td>
                      <Button variant="ghost" className="btn-sm" onClick={() => setEditing({ ...f })}>Edit</Button>{' '}
                      <Button variant="danger" className="btn-sm" onClick={() => remove(f)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit food' : 'Add food'} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Name" value={editing.name} onChange={(e) => set({ name: e.target.value })} required />
              <Field label="Category" value={editing.category} onChange={(e) => set({ category: e.target.value })} required />
              <Field label="Serving unit" value={editing.serving_unit} onChange={(e) => set({ serving_unit: e.target.value })} />
              <Field label="Serving size" type="number" value={editing.serving_size} onChange={(e) => set({ serving_size: Number(e.target.value) })} />
              <Field label="Calories (kcal)" type="number" value={editing.calories} onChange={(e) => set({ calories: Number(e.target.value) })} />
              <Field label="Protein (g)" type="number" value={editing.protein_g} onChange={(e) => set({ protein_g: Number(e.target.value) })} />
              <Field label="Carbs (g)" type="number" value={editing.carbs_g} onChange={(e) => set({ carbs_g: Number(e.target.value) })} />
              <Field label="Fat (g)" type="number" value={editing.fat_g} onChange={(e) => set({ fat_g: Number(e.target.value) })} />
              <Field label="Fiber (g)" type="number" value={editing.fiber_g} onChange={(e) => set({ fiber_g: Number(e.target.value) })} />
            </div>
            <TextArea label="Description" value={editing.description} onChange={(e) => set({ description: e.target.value })} />
            <div>
              <Checkbox label="Vegetarian" checked={editing.is_vegetarian} onChange={(e) => set({ is_vegetarian: e.target.checked })} />
              <Checkbox label="Vegan" checked={editing.is_vegan} onChange={(e) => set({ is_vegan: e.target.checked })} />
              <Checkbox label="Contains egg" checked={editing.contains_egg} onChange={(e) => set({ contains_egg: e.target.checked })} />
              <Checkbox label="Contains dairy" checked={editing.contains_dairy} onChange={(e) => set({ contains_dairy: e.target.checked })} />
              <Checkbox label="Contains peanuts" checked={editing.contains_peanuts} onChange={(e) => set({ contains_peanuts: e.target.checked })} />
              <Checkbox label="Contains gluten" checked={editing.contains_gluten} onChange={(e) => set({ contains_gluten: e.target.checked })} />
              <Checkbox label="Contains soy" checked={editing.contains_soy} onChange={(e) => set({ contains_soy: e.target.checked })} />
              <Checkbox label="Contains seafood" checked={editing.contains_seafood} onChange={(e) => set({ contains_seafood: e.target.checked })} />
            </div>
            <div className="form-actions">
              <Button type="submit">Save</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
