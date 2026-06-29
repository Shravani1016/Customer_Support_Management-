'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api';

import { Task } from '@/types';



const priorityColors: Record<string, string> = {

  low: 'bg-green-100 text-green-700',

  medium: 'bg-yellow-100 text-yellow-700',

  high: 'bg-red-100 text-red-700',

};



export default function TasksPage() {

  const [tasks, setTasks] = useState<Task[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });



  const fetchTasks = () => api.get('/api/tasks').then(res => setTasks(res.data));



  useEffect(() => { fetchTasks(); }, []);



  const handleCreate = async () => {

    await api.post('/api/tasks', form);

    setForm({ title: '', description: '', priority: 'medium' });

    setShowForm(false);

    fetchTasks();

  };



  const handleComplete = async (task: Task) => {

    await api.put(`/api/tasks/${task.id}`, { is_completed: !task.is_completed });

    fetchTasks();

  };



  return (

    <div>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>

        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">

          + Add Task

        </button>

      </div>



      {showForm && (

        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">

          <h2 className="font-semibold text-gray-700 mb-4">New Task</h2>

          <div className="grid grid-cols-2 gap-4">

            <input

              placeholder="Title"

              value={form.title}

              onChange={e => setForm({ ...form, title: e.target.value })}

              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

            />

            <input

              placeholder="Description"

              value={form.description}

              onChange={e => setForm({ ...form, description: e.target.value })}

              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

            />

            <select

              value={form.priority}

              onChange={e => setForm({ ...form, priority: e.target.value })}

              className="border rounded-lg px-3 py-2 text-sm"

            >

              {['low', 'medium', 'high'].map(p => (

                <option key={p} value={p}>{p}</option>

              ))}

            </select>

          </div>

          <div className="flex gap-2 mt-4">

            <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Save</button>

            <button onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>

          </div>

        </div>

      )}



      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600 border-b">

            <tr>

              {['Done', 'Title', 'Description', 'Priority', 'Status'].map(h => (

                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>

              ))}

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {tasks.length === 0 ? (

              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No tasks yet.</td></tr>

            ) : (

              tasks.map(task => (

                <tr key={task.id} className="hover:bg-gray-50">

                  <td className="px-4 py-3">

                    <input

                      type="checkbox"

                      checked={task.is_completed}

                      onChange={() => handleComplete(task)}

                      className="w-4 h-4"

                    />

                  </td>

                  <td className={`px-4 py-3 font-medium ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>

                    {task.title}

                  </td>

                  <td className="px-4 py-3 text-gray-500">{task.description || '—'}</td>

                  <td className="px-4 py-3">

                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>

                      {task.priority}

                    </span>

                  </td>

                  <td className="px-4 py-3 text-gray-500">

                    {task.is_completed ? '✅ Done' : '⏳ Pending'}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}
