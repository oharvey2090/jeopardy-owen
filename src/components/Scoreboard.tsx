import React, { useCallback, useEffect, useState } from "react";
import { Player } from "../types";
import "./Scoreboard.css";

/**
class Scoreboard extends React.Component {

}
*/

interface ScoreboardProps {
  // The value of the current clue on the board
  currentValue: number | null;
  players: Player[];
  stats: boolean;
  updateScore: (i: number, clueValue: number, correct: boolean) => void;
  wagering: boolean;
}

function Scoreboard(props: ScoreboardProps) {
  const { currentValue, players, stats, updateScore, wagering } = props;

  const [wagers, setWagers] = useState<string[]>(() => {
    return players.map(() => "");
  });

  // Define keyboard shortcut mappings
  const incorrectKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o"];

  const updateScoreboardScore = useCallback(
    (i: number, clueValue: number, correct: boolean) => {
      setWagers(
        wagers.map((existingWager, wagerIndex) =>
          wagerIndex === i ? "" : existingWager
        )
      );
      updateScore(i, clueValue, correct);
    },
    [wagers, updateScore]
  );

  //create event listeners for correct and incorrect answers 1,2,... is index+1 for correct answers, q,w,e...across top for incorrect
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Only handle shortcuts when there's an active clue
      if (currentValue === null) return;

      // Prevent shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement) return;

      const correctKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const incorrectKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o"];

      let playerIndex = -1;
      let isCorrect = false;

      // Check for correct answer shortcuts (1-9)
      const correctIndex = correctKeys.indexOf(event.key);
      if (correctIndex !== -1) {
        playerIndex = correctIndex;
        isCorrect = true;
      }

      // Check for incorrect answer shortcuts (qwerty row)
      const incorrectIndex = incorrectKeys.indexOf(event.key.toLowerCase());
      if (incorrectIndex !== -1) {
        playerIndex = incorrectIndex;
        isCorrect = false;
      }

      // Execute the score update if valid player index
      if (playerIndex !== -1 && playerIndex < players.length) {
        event.preventDefault();
        event.stopPropagation();

        const clueValue = wagering
          ? parseInt(wagers[playerIndex]) || 0
          : currentValue;
        if (clueValue !== null) {
          updateScoreboardScore(
            playerIndex,
            isCorrect ? clueValue : -clueValue,
            isCorrect
          );
        }
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [
    players,
    updateScore,
    updateScoreboardScore,
    wagers,
    currentValue,
    wagering,
  ]);

  function renderPlayer(player: Player, i: number) {
    const scoreString =
      player.score >= 0 ? `$${player.score}` : `-$${-player.score}`;

    const clueValue: number | null =
      currentValue === null
        ? null
        : wagering === false
        ? currentValue
        : parseInt(wagers[i]) || 0;
    return (
      <div key={i} className="podium">
        <div className="podium-score">{scoreString}</div>
        <div className="podium-name">{player.name}</div>
        {wagering && (
          <div>
            <input
              className="wager-box"
              value={wagers[i]}
              onChange={(event) => changeWager(i, event.target.value)}
            />
          </div>
        )}
        {currentValue !== null && clueValue !== null && (
          <div className="answer-buttons">
            <button
              id={`incorrect-answer-${i}`}
              data-playerIndex={i}
              onClick={() => updateScoreboardScore(i, -clueValue, false)}
              className="incorrect-answer"
            >
              -${clueValue}
              {i < incorrectKeys.length && (
                <span className="keyboard-hint">
                  {incorrectKeys[i].toUpperCase()}
                </span>
              )}
            </button>
            <button
              id={`correct-answer-${i}`}
              data-playerIndex={i}
              onClick={() => updateScoreboardScore(i, clueValue, true)}
              className="correct-answer"
            >
              +${clueValue}
              {i < 9 && <span className="keyboard-hint">{i + 1}</span>}
            </button>
          </div>
        )}
        {stats && (
          <div className="stats">
            <hr />
            <div>Correct: {player.correct}</div>
            <div>Incorrect: {player.incorrect}</div>
          </div>
        )}
      </div>
    );
  }

  function changeWager(i: number, wager: string) {
    setWagers(
      wagers.map((existingWager, wagerIndex) =>
        wagerIndex === i ? wager : existingWager
      )
    );
  }

  return (
    <div className="scoreboard">
      {players.map((player, i) => renderPlayer(player, i))}
    </div>
  );
}

export default Scoreboard;
