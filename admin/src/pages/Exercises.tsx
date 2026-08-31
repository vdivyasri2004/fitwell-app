import { FormEvent, useEffect, useState } from 'react';
import { Button, Field, Select, TextArea, Modal, Spinner } from '../components/ui';
import { Exercise, allExercises, upsertExercise, deleteExercise } from '../lib/admin';

const EMPTY: Partial<Exercise> = { name: '', category: 'General', muscle_group: 'Full body', difficulty: 'beginner', equipment: 'None', instructions: '', duration_minutes: 10, estimated_calories: 0 };

export default function Exercises() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [editing, setEditing] = useState<Partial<Exercise> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await allExercises());
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
      await upsertExercise(editing);
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (ex: Exercise) => {
    if (!window.confirm(`Delete "${ex.name}"?`)) return;
    setError('');
    try {
      await deleteExercise(ex.id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const set = (patch: Partial<Exercise>) => setEditing((prev) => ({ ...(prev ?? EMPTY), ...patch }));

  return (
    <div>
      <div className="page-header">
        <div><h1>Exercises</h1><p>{items.length} exercises</p></div>
        <Button onClick={() => setEditing({ ...EMPTY })}>Add exercise</Button>
      </div>
      {error ? <div className="error-banner">{error}</div> : null}
      <div className="panel">
        <div className="table-wrap">
          {loading ? (
            <div className="center-loading"><Spinner /></div>
          ) : items.length === 0 ? (
            <div className="empty">No exercises found.</div>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Muscle group</th><th>Difficulty</th><th>Equipment</th><th>Min</th><th>kcal</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((ex) => (
                  <tr key={ex.id}>
                    <td>{ex.name}</td>
                    <td><span className="pill">{ex.muscle_group}</span></td>
                    <td><span className="pill">{ex.difficulty}</span></td>
                    <td>{ex.equipment}</td>
                    <td>{ex.duration_minutes}</td>
                    <td>{ex.estimated_calories}</td>
                    <td>
                      <Button variant="ghost" className="btn-sm" onClick={() => setEditing({ ...ex })}>Edit</Button>{' '}
                      <Button variant="danger" className="btn-sm" onClick={() => remove(ex)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit exercise' : 'Add exercise'} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Name" value={editing.name} onChange={(e) => set({ name: e.target.value })} required />
              <Field label="Category" value={editing.category} onChange={(e) => set({ category: e.target.value })} />
              <Field label="Muscle group" value={editing.muscle_group} onChange={(e) => set({ muscle_group: e.target.value })} />
              <Select label="Difficulty" value={editing.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
              <Field label="Equipment" value={editing.equipment} onChange={(e) => set({ equipment: e.target.value })} />
              <Field label="Duration (min)" type="number" value={editing.duration_minutes} onChange={(e) => set({ duration_minutes: Number(e.target.value) })} />
              <Field label="Est. calories" type="number" value={editing.estimated_calories} onChange={(e) => set({ estimated_calories: Number(e.target.value) })} />
            </div>
            <TextArea label="Instructions" value={editing.instructions} onChange={(e) => set({ instructions: e.target.value })} />
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
