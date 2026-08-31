import { FormEvent, useEffect, useState } from 'react';
import { Button, Field, Select, TextArea, Modal, Spinner } from '../components/ui';
import { Workout, Exercise, WorkoutExercise, allWorkouts, upsertWorkout, deleteWorkout, allExercises, workoutExercises, saveWorkoutExercises } from '../lib/admin';

interface EditRow {
  exercise_id: string;
  order_index: number;
  sets: number;
  reps: number;
  duration_seconds: number;
  rest_seconds: number;
}

const EMPTY: Partial<Workout> = { name: '', description: '', goal: 'maintain', difficulty: 'beginner', duration_minutes: 30, workout_type: 'Strength' };

export default function Workouts() {
  const [items, setItems] = useState<Workout[]>([]);
  const [editing, setEditing] = useState<Partial<Workout> | null>(null);
  const [rows, setRows] = useState<EditRow[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await allWorkouts());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEditor = async (w: Workout) => {
    setError('');
    setEditing({ ...w });
    setRows([]);
    try {
      setExercises(await allExercises());
      if (w.id) {
        const we = await workoutExercises(w.id);
        setRows((we as WorkoutExercise[]).map((r) => ({
          exercise_id: r.exercise_id,
          order_index: r.order_index,
          sets: r.sets,
          reps: r.reps,
          duration_seconds: r.duration_seconds,
          rest_seconds: r.rest_seconds,
        })));
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError('');
    try {
      const saved = await upsertWorkout(editing);
      if (rows.length > 0) {
        await saveWorkoutExercises(saved.id, rows);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (w: Workout) => {
    if (!window.confirm(`Delete "${w.name}"?`)) return;
    setError('');
    try {
      await deleteWorkout(w.id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const set = (patch: Partial<Workout>) => setEditing((prev) => ({ ...(prev ?? EMPTY), ...patch }));

  const updateRow = (i: number, patch: Partial<EditRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows((prev) => [...prev, { exercise_id: exercises[0]?.id ?? '', order_index: prev.length, sets: 3, reps: 10, duration_seconds: 0, rest_seconds: 60 }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="page-header">
        <div><h1>Workouts</h1><p>{items.length} workouts</p></div>
        <Button onClick={() => { setEditing({ ...EMPTY }); setRows([]); }}>Add workout</Button>
      </div>
      {error ? <div className="error-banner">{error}</div> : null}
      <div className="panel">
        <div className="table-wrap">
          {loading ? (
            <div className="center-loading"><Spinner /></div>
          ) : items.length === 0 ? (
            <div className="empty">No workouts found.</div>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Goal</th><th>Difficulty</th><th>Duration</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td><span className="pill">{w.workout_type}</span></td>
                    <td><span className="pill">{w.goal}</span></td>
                    <td><span className="pill">{w.difficulty}</span></td>
                    <td>{w.duration_minutes} min</td>
                    <td>
                      <Button variant="ghost" className="btn-sm" onClick={() => openEditor(w)}>Edit</Button>{' '}
                      <Button variant="danger" className="btn-sm" onClick={() => remove(w)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit workout' : 'Add workout'} onClose={() => setEditing(null)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <Field label="Name" value={editing.name} onChange={(e) => set({ name: e.target.value })} required />
              <Field label="Workout type" value={editing.workout_type} onChange={(e) => set({ workout_type: e.target.value })} />
              <Select label="Goal" value={editing.goal} onChange={(e) => set({ goal: e.target.value })}>
                <option value="lose_weight">Lose weight</option>
                <option value="build_muscle">Build muscle</option>
                <option value="gain_weight">Gain weight</option>
                <option value="maintain">Maintain</option>
              </Select>
              <Select label="Difficulty" value={editing.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
              <Field label="Duration (min)" type="number" value={editing.duration_minutes} onChange={(e) => set({ duration_minutes: Number(e.target.value) })} />
            </div>
            <TextArea label="Description" value={editing.description} onChange={(e) => set({ description: e.target.value })} />

            <div className="panel-head" style={{ marginTop: 12, padding: '10px 2px' }}>
              <h2>Exercises</h2>
              <Button variant="ghost" className="btn-sm" type="button" onClick={addRow}>+ Add exercise</Button>
            </div>
            {rows.map((r, i) => (
              <div key={i} className="form-row" style={{ marginBottom: 10 }}>
                <Select
                  label="Exercise"
                  value={r.exercise_id}
                  onChange={(e) => updateRow(i, { exercise_id: e.target.value })}
                  style={{ flex: 1 }}
                >
                  <option value="">Select…</option>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </Select>
                <Field label="Sets" type="number" value={r.sets} onChange={(e) => updateRow(i, { sets: Number(e.target.value) })} style={{ width: 70 }} />
                <Field label="Reps" type="number" value={r.reps} onChange={(e) => updateRow(i, { reps: Number(e.target.value) })} style={{ width: 70 }} />
                <Field label="Sec" type="number" value={r.duration_seconds} onChange={(e) => updateRow(i, { duration_seconds: Number(e.target.value) })} style={{ width: 70 }} />
                <Button variant="danger" className="btn-sm" type="button" onClick={() => removeRow(i)} style={{ alignSelf: 'flex-end' }}>×</Button>
              </div>
            ))}

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
