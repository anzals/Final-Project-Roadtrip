import React, { useState, useEffect } from "react";
import api from "../api";
import { validateEmail } from "../utils/validate";
import "../styles/CollaboratorManager.css";

function CollaboratorManager({ tripId }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    owner: null,
    collaborators: [],
    isOwner: false
  });

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);

  // fetch function
  const loadCollaborators = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await api.get(`/api/trip/${tripId}/collaborators/`);
      const data = response.data?.data || response.data || {};
      const collaborators = Array.isArray(data.collaborators) ? data.collaborators : [];

      setState({
        loading: false,
        error: null,
        owner: data.owner || null,
        collaborators: collaborators,
        isOwner: data.is_owner || data.current_user_is_owner || false
      });
    } catch (err) {
      setState({
        loading: false,
        error: err.response?.data?.message || err.message,
        owner: null,
        collaborators: [],
        isOwner: false
      });
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, [tripId]);

  const handleAddCollaborator = async () => {
    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }

    setMessage({ text: "Adding...", type: "info" });
    setState(prev => ({ ...prev, loading: true }));

    try {
      await api.post(`/api/trip/${tripId}/collaborators/`, { email });
      setEmail('');
      setMessage({ text: "Collaborator added!", type: "success" });
      await loadCollaborators();
    } catch (err) {
      setMessage({
        text: err.response?.data?.detail || "Failed to add collaborator",
        type: "error"
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  if (state.loading) return <div className="loading-spinner">Loading...</div>;
  if (state.error) return <div className="error-alert">Error: {state.error}</div>;

  return (
    <div className="collaborator-container">
      <div className="collaborator-left">
        <div className="owner-section">
          <h3>Trip Owner</h3>
          {state.owner ? (
            <p>
              <strong>{state.owner.full_name || `${state.owner.first_name} ${state.owner.last_name}`}</strong>
              <br />
              <span className="email-muted">{state.owner.email}</span>
            </p>
          ) : (
            <p>No owner information available</p>
          )}
        </div>

        <div className="collaborators-section">
          <h3>Collaborators</h3>
          {state.collaborators.length > 0 ? (
            <ul className="collaborator-list">
              {state.collaborators.map((user) => (
                <li key={user.id}>
                  <div><strong>{user.first_name} {user.last_name}</strong></div>
                  <div className="email-muted">{user.email}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No collaborators have been added</p>
          )}
        </div>
      </div>

      <div className="collaborator-right">
        {state.isOwner ? (
          <div className="add-collaborator-form">
            <h4>Add New Collaborator</h4>
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter collaborator's email"
                className="email-input"
              />
              <button
                onClick={handleAddCollaborator}
                className="add-button"
              >
                Add Collaborator
              </button>
            </div>
            {message && typeof message === 'object' && (
              <p className={`message ${message.type}`}>{message.text}</p>
            )}
          </div>
        ) : (
          <p className="info-note">Only the trip owner can add collaborators</p>
        )}
      </div>
    </div>
  );
}

export default CollaboratorManager;
