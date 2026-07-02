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



  // Search and filter states

  const [searchQuery, setSearchQuery] = useState('');

  const [priorityFilter, setPriorityFilter] = useState('all');

  const [statusFilter, setStatusFilter] = useState('all');



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



  const handleClearFilters = () => {

    setSearchQuery('');

    setPriorityFilter('all');

    setStatusFilter('all');

  };



  // Real-time filtering logic

  const filteredTasks = tasks.filter(task => {

    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = !query ||

      task.title.toLowerCase().includes(query) ||

      (task.description && task.description.toLowerCase().includes(query));



    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;



    let matchesStatus = true;

    if (statusFilter === 'done') {

      matchesStatus = task.is_completed === true;

    } else if (statusFilter === 'pending') {

      matchesStatus = task.is_completed === false;

    }



    return matchesSearch && matchesPriority && matchesStatus;

  });



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

              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"

            />

            <input

              placeholder="Description"

              value={form.description}

              onChange={e => setForm({ ...form, description: e.target.value })}

              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"

            />

            <select

              value={form.priority}

              onChange={e => setForm({ ...form, priority: e.target.value })}

              className="border rounded-lg px-3 py-2 text-sm text-black"

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



      {/* Search and Filters Bar */}

      <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">

        <div className="relative w-full md:w-96 shrink-0">

          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">

            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>

            </svg>

          </span>

          <input

            type="text"

            placeholder="Search by title or description..."

            value={searchQuery}

            onChange={e => setSearchQuery(e.target.value)}

            className="pl-10 pr-4 h-10 w-full border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100/50 transition-colors"

          />

        </div>



        <div className="flex flex-wrap items-center gap-4 justify-start md:justify-end">

          <div className="flex items-center gap-2">

            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Priority:</span>

            <select

              value={priorityFilter}

              onChange={e => setPriorityFilter(e.target.value)}

              className="h-10 border rounded-lg px-3 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-32.5"

            >

              <option value="all">All Priorities</option>

              <option value="low">Low</option>

              <option value="medium">Medium</option>

              <option value="high">High</option>

            </select>

          </div>



          <div className="flex items-center gap-2">

            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status:</span>

            <select

              value={statusFilter}

              onChange={e => setStatusFilter(e.target.value)}

              className="h-10 border rounded-lg px-3 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-32.5"

            >

              <option value="all">All Statuses</option>

              <option value="done">Done</option>

              <option value="pending">Pending</option>

            </select>

          </div>



          {(searchQuery || priorityFilter !== 'all' || statusFilter !== 'all') && (

            <button

              onClick={handleClearFilters}

              className="h-10 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-2 hover:underline cursor-pointer flex items-center"

            >

              Clear Filters

            </button>

          )}

        </div>

      </div>



      {/* Filter Stats */}

      <div className="flex justify-between items-center px-1 mb-2">

        <span className="text-xs text-gray-500 font-medium">

          {tasks.length === 0 

            ? 'No tasks available' 

            : `Showing ${filteredTasks.length} of ${tasks.length} tasks`}

        </span>

      </div>



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

            ) : filteredTasks.length === 0 ? (

              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No tasks match your search criteria.</td></tr>

            ) : (

              filteredTasks.map(task => (

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
