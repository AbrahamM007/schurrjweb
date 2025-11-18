import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../hooks/useAuth";

export default function TeamManager() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    due_date: ""
  });
  const { supabaseUser, isAdmin } = useAuth();

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadTasks = async () => {
    const { data } = await supabase
      .from("team_tasks")
      .select(`
        *,
        assigned_user:users!team_tasks_assigned_to_fkey(display_name, email),
        creator:users!team_tasks_created_by_fkey(display_name, email)
      `)
      .order("created_at", { ascending: false });
    setTasks(data || []);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("display_name", { ascending: true });
    setUsers(data || []);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    await supabase.from("team_tasks").insert({
      title: form.title,
      description: form.description,
      assigned_to: form.assigned_to || null,
      priority: form.priority,
      due_date: form.due_date || null,
      status: "pending",
      created_by: supabaseUser?.id
    });
    setForm({
      title: "",
      description: "",
      assigned_to: "",
      priority: "medium",
      due_date: ""
    });
    loadTasks();
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    await supabase
      .from("team_tasks")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId);
    loadTasks();
  };

  const handleDeleteTask = async (taskId) => {
    await supabase.from("team_tasks").delete().eq("id", taskId);
    loadTasks();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#27ae60";
      case "in_progress":
        return "#f39c12";
      default:
        return "#95a5a6";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#e74c3c";
      case "medium":
        return "#f39c12";
      default:
        return "#3498db";
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        Team Task Management
      </h2>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Assign tasks to team members and track progress
      </p>

      {isAdmin && (
        <form onSubmit={handleCreateTask} style={{ marginBottom: "2rem" }}>
          <div className="form-grid">
            <div>
              <div className="field-label">Task Title</div>
              <input
                className="field-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Edit episode 12"
                required
              />
            </div>
            <div>
              <div className="field-label">Description</div>
              <textarea
                className="field-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Details about the task..."
                rows={3}
              />
            </div>
            <div>
              <div className="field-label">Assign To</div>
              <select
                className="field-input"
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="field-label">Priority</div>
              <select
                className="field-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <div className="field-label">Due Date</div>
              <input
                className="field-input"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          <button className="primary-btn" style={{ marginTop: "1rem" }}>
            Create Task
          </button>
        </form>
      )}

      <div className="submission-list">
        {tasks.map((task) => (
          <div key={task.id} className="admin-card">
            <div className="admin-card-main" style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.5rem" }}>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {task.title}
                </div>
                <span
                  style={{
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: getPriorityColor(task.priority),
                    color: "white"
                  }}
                >
                  {task.priority}
                </span>
                <span
                  style={{
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: getStatusColor(task.status),
                    color: "white"
                  }}
                >
                  {task.status.replace("_", " ")}
                </span>
              </div>
              {task.description && (
                <div className="text-muted" style={{ marginBottom: "0.5rem" }}>
                  {task.description}
                </div>
              )}
              <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
                {task.assigned_user ? (
                  <span>
                    <strong>Assigned to:</strong> {task.assigned_user.display_name}
                  </span>
                ) : (
                  <span className="text-muted">Unassigned</span>
                )}
                {task.due_date && (
                  <span style={{ marginLeft: "1rem" }}>
                    <strong>Due:</strong> {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="admin-card-actions">
              {task.status !== "completed" && (
                <>
                  {task.status === "pending" && (
                    <button
                      className="primary-btn"
                      onClick={() => handleUpdateStatus(task.id, "in_progress")}
                    >
                      Start
                    </button>
                  )}
                  {task.status === "in_progress" && (
                    <button
                      className="primary-btn"
                      onClick={() => handleUpdateStatus(task.id, "completed")}
                    >
                      Complete
                    </button>
                  )}
                </>
              )}
              {isAdmin && (
                <button
                  className="secondary-btn"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-muted">No tasks yet. Create one above!</div>
        )}
      </div>
    </div>
  );
}
