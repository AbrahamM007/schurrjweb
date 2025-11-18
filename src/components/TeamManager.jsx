import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../hooks/useAuth";

export default function TeamManager() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: ""
  });
  const { supabaseUser, isAdmin } = useAuth();

  useEffect(() => {
    loadTasks();
    loadUsers();

    const channel = supabase
      .channel('team_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_tasks'
        },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTasks = async () => {
    const { data } = await supabase
      .from("team_tasks")
      .select("*, profiles!team_tasks_assigned_to_fkey(full_name, email)")
      .order("created_at", { ascending: false });
    setTasks(data || []);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });
    setUsers(data || []);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (editingTask) {
      await supabase
        .from("team_tasks")
        .update({
          title: form.title,
          description: form.description,
          assigned_to: form.assigned_to || null,
          due_date: form.due_date || null
        })
        .eq("id", editingTask.id);
    } else {
      await supabase.from("team_tasks").insert({
        title: form.title,
        description: form.description,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
        status: "pending"
      });
    }
    setForm({
      title: "",
      description: "",
      assigned_to: "",
      due_date: ""
    });
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    await supabase
      .from("team_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);
    loadTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm("Delete this task?")) {
      await supabase.from("team_tasks").delete().eq("id", taskId);
      loadTasks();
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      assigned_to: task.assigned_to || "",
      due_date: task.due_date || ""
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setForm({
      title: "",
      description: "",
      assigned_to: "",
      due_date: ""
    });
  };

  const groupedTasks = {
    pending: tasks.filter((t) => t.status === "pending"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    completed: tasks.filter((t) => t.status === "completed")
  };

  const renderTask = (task) => (
    <div key={task.id} className="kanban-card">
      <div className="kanban-card-header">
        <h4 className="kanban-card-title">{task.title}</h4>
        <div className="kanban-card-actions">
          <button
            className="kanban-icon-btn"
            onClick={() => handleEditTask(task)}
            title="Edit"
          >
            ✎
          </button>
          {isAdmin && (
            <button
              className="kanban-icon-btn"
              onClick={() => handleDeleteTask(task.id)}
              title="Delete"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="kanban-card-description">{task.description}</p>
      )}

      <div className="kanban-card-footer">
        {task.profiles && (
          <div className="kanban-assignee">
            <span className="kanban-avatar">
              {task.profiles.full_name?.[0]?.toUpperCase() || "?"}
            </span>
            <span className="kanban-assignee-name">{task.profiles.full_name}</span>
          </div>
        )}
        {task.due_date && (
          <div className="kanban-due-date">
            📅 {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="kanban-card-move">
        {task.status === "pending" && (
          <button
            className="kanban-move-btn"
            onClick={() => handleUpdateStatus(task.id, "in_progress")}
          >
            Start →
          </button>
        )}
        {task.status === "in_progress" && (
          <>
            <button
              className="kanban-move-btn secondary"
              onClick={() => handleUpdateStatus(task.id, "pending")}
            >
              ← Back
            </button>
            <button
              className="kanban-move-btn"
              onClick={() => handleUpdateStatus(task.id, "completed")}
            >
              Complete →
            </button>
          </>
        )}
        {task.status === "completed" && (
          <button
            className="kanban-move-btn secondary"
            onClick={() => handleUpdateStatus(task.id, "in_progress")}
          >
            ← Reopen
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="team-manager">
      <div className="team-manager-header">
        <h2 className="team-manager-title">Team Board</h2>
        <button
          className="kanban-add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Cancel" : "+ New Task"}
        </button>
      </div>

      {showForm && (
        <div className="kanban-form-overlay" onClick={cancelForm}>
          <div className="kanban-form-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="kanban-form-title">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h3>
            <form onSubmit={handleCreateTask}>
              <div className="kanban-form-field">
                <label className="kanban-form-label">Task Title *</label>
                <input
                  className="kanban-form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Edit episode 12"
                  required
                  autoFocus
                />
              </div>

              <div className="kanban-form-field">
                <label className="kanban-form-label">Description</label>
                <textarea
                  className="kanban-form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Add more details..."
                  rows={4}
                />
              </div>

              <div className="kanban-form-row">
                <div className="kanban-form-field">
                  <label className="kanban-form-label">Assign To</label>
                  <select
                    className="kanban-form-select"
                    value={form.assigned_to}
                    onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="kanban-form-field">
                  <label className="kanban-form-label">Due Date</label>
                  <input
                    className="kanban-form-input"
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="kanban-form-actions">
                <button type="button" className="kanban-form-cancel" onClick={cancelForm}>
                  Cancel
                </button>
                <button type="submit" className="kanban-form-submit">
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="kanban-board">
        <div className="kanban-column">
          <div className="kanban-column-header">
            <h3 className="kanban-column-title">
              <span className="kanban-status-dot pending"></span>
              To Do
            </h3>
            <span className="kanban-count">{groupedTasks.pending.length}</span>
          </div>
          <div className="kanban-column-content">
            {groupedTasks.pending.map(renderTask)}
            {groupedTasks.pending.length === 0 && (
              <div className="kanban-empty">No tasks yet</div>
            )}
          </div>
        </div>

        <div className="kanban-column">
          <div className="kanban-column-header">
            <h3 className="kanban-column-title">
              <span className="kanban-status-dot in-progress"></span>
              In Progress
            </h3>
            <span className="kanban-count">{groupedTasks.in_progress.length}</span>
          </div>
          <div className="kanban-column-content">
            {groupedTasks.in_progress.map(renderTask)}
            {groupedTasks.in_progress.length === 0 && (
              <div className="kanban-empty">No tasks in progress</div>
            )}
          </div>
        </div>

        <div className="kanban-column">
          <div className="kanban-column-header">
            <h3 className="kanban-column-title">
              <span className="kanban-status-dot completed"></span>
              Completed
            </h3>
            <span className="kanban-count">{groupedTasks.completed.length}</span>
          </div>
          <div className="kanban-column-content">
            {groupedTasks.completed.map(renderTask)}
            {groupedTasks.completed.length === 0 && (
              <div className="kanban-empty">No completed tasks</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
