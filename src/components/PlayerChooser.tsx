import { ChangeEvent, KeyboardEvent, useState } from "react";

import { Player } from "../types";

import "./PlayerChooser.css";

interface PlayerChooserProps {
  addPlayer: (name: string) => void;
  removePlayer: (name: string) => void;
  editPlayer: (oldName: string, newName: string) => void;
  players: Player[];
  playGame: () => void;
}

function PlayerChooser(props: PlayerChooserProps) {
  const {
    addPlayer: addPlayerByName,
    playGame,
    players,
    removePlayer,
    editPlayer,
  } = props;
  const [name, setName] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function addPlayer() {
    if (name.trim().length === 0) return;
    addPlayerByName(name);
    setName("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      addPlayer();
    }
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function startEditing(playerName: string) {
    setEditingPlayer(playerName);
    setEditName(playerName);
  }

  function saveEdit() {
    if (editName.trim().length === 0 || !editingPlayer) return;
    editPlayer(editingPlayer, editName.trim());
    setEditingPlayer(null);
    setEditName("");
  }

  function cancelEdit() {
    setEditingPlayer(null);
    setEditName("");
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      saveEdit();
    } else if (event.key === "Escape") {
      cancelEdit();
    }
  }

  return (
    <div className="player-chooser">
      <div>
        <h1>Players</h1>
        <ul className="player-list">
          {players.map((player, i) => (
            <li key={i} className="player-item">
              {editingPlayer === player.name ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="edit-input"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="save-btn" title="Save">
                    ✓
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="cancel-btn"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="view-mode">
                  <span className="player-name">{player.name}</span>
                  <div className="player-actions">
                    <button
                      onClick={() => startEditing(player.name)}
                      className="edit-btn"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removePlayer(player.name)}
                      className="remove-btn"
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="input-container">
        <input
          value={name}
          onKeyDown={handleKeyDown}
          onChange={handleNameChange}
          autoFocus
          type="text"
          placeholder="Player Name"
        />
        <button className="add-player-button" onClick={addPlayer}>
          Add Player
        </button>
      </div>
      <div>
        <button
          className="play-game-button"
          onClick={playGame}
          disabled={players.length === 0}
        >
          Play Game
        </button>
      </div>
    </div>
  );
}

export default PlayerChooser;
