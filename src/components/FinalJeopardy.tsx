import { useEffect, useState } from "react";
import { FinalRound } from "../types";

interface FinalJeopardyProps {
  final: FinalRound;
  onFinishGame: () => void;
  downloadGame: () => void;
  restartGame: () => void;
}

function FinalJeopardy(props: FinalJeopardyProps) {
  const { final, onFinishGame, downloadGame, restartGame } = props;

  const [category, setCategory] = useState(true);
  const [solution, setSolution] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", clueKeyPress);
    return () => {
      document.removeEventListener("keydown", clueKeyPress);
    };
  });

  function showClue() {
    setCategory(false);
    setSolution(false);
  }

  function toggleSolution() {
    setSolution(!solution);
  }

  function toggleMenu() {
    setShowMenu(!showMenu);
  }

  function clueKeyPress(event: KeyboardEvent) {
    if (event.key === " " || event.key === "Enter") {
      if (category) {
        showClue();
      } else {
        toggleSolution();
      }
    } else if (event.key === "Escape" && !category && solution) {
      onFinishGame();
    }
  }

  if (category) {
    return (
      <>
        <div onClick={showClue} className="clue">
          <div className="clue-display final-category">{final.category}</div>
        </div>
        <button className="menu-toggle" onClick={toggleMenu} title="Menu">
          ☰
        </button>
        {showMenu && (
          <div className="menu-dropdown">
            <button onClick={downloadGame} className="menu-item">
              💾 Backup
            </button>
            <button onClick={restartGame} className="menu-item">
              🔄 Restart
            </button>
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <div onClick={solution ? onFinishGame : toggleSolution} className="clue">
        <div className="clue-display">
          {final.html === true ? (
            <div
              dangerouslySetInnerHTML={{
                __html: solution ? final.solution : final.clue,
              }}
            />
          ) : solution ? (
            final.solution
          ) : (
            final.clue
          )}
        </div>
      </div>
      <button className="menu-toggle" onClick={toggleMenu} title="Menu">
        ☰
      </button>
      {showMenu && (
        <div className="menu-dropdown">
          <button onClick={downloadGame} className="menu-item">
            💾 Backup
          </button>
          <button onClick={restartGame} className="menu-item">
            🔄 Restart
          </button>
        </div>
      )}
    </>
  );
}

export default FinalJeopardy;
