
"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  age: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setError("");

      const response = await fetch("/api/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Add user
  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !age) {
      setError("Please fill all fields");
      return;
    }

    try {
      setError("");

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          age: Number(age),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers((prevUsers) => [...prevUsers, data]);

      resetForm();
    } catch (error) {
      console.error("Failed to add user", error);
      setError("Failed to add user");
    }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    try {
      setError("");

      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== id)
      );
    } catch (error) {
      console.error("Failed to delete user", error);
      setError("Failed to delete user");
    }
  };

  // Start editing
  const editUser = (user: User) => {
    setEditingId(user._id);
    setName(user.name);
    setEmail(user.email);
    setAge(String(user.age));
    setError("");
  };

  // Update user
  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) return;

    if (!name || !email || !age) {
      setError("Please fill all fields");
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/users/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          age: Number(age),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === editingId ? data : user
        )
      );

      resetForm();
    } catch (error) {
      console.error("Failed to update user", error);
      setError("Failed to update user");
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setEmail("");
    setAge("");
    setEditingId(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading users...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center">
        User Management
      </h1>

      <br />

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-center mb-4">
          {error}
        </p>
      )}

      {/* User Form */}
      <form
        onSubmit={editingId ? updateUser : addUser}
        className="flex flex-col gap-3"
      >
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            type="submit"
          >
            {editingId ? "Update User" : "Add User"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <br />

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {users.map((user) => (
          <div
            className="border-2 rounded p-4"
            key={user._id}
          >
            <h2 className="font-bold">
              Name: {user.name}
            </h2>

            <p>Email: {user.email}</p>

            <p>Age: {user.age}</p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => editUser(user)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => deleteUser(user._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

