import { useEffect, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Clue, GameRound } from "../types";
import "./JeopardyBoard.css";

interface JeopardyBoardProps {
  backToBoard: () => void;
  board: GameRound;
  categoryShown: () => void;
  categoriesShown: number;
  chooseClue: (categoryIndex: number, clueIndex: number) => void;
  closeClue: (categoryIndex: number, clueIndex: number) => void;
  currentCategory: number | null;
  currentClue: number | null;
  downloadGame: () => void;
  restartGame: () => void;
}

function JeopardyBoard(props: JeopardyBoardProps) {
  const {
    backToBoard,
    board,
    categoryShown,
    categoriesShown,
    chooseClue,
    closeClue,
    currentCategory,
    currentClue,
    downloadGame,
    restartGame,
  } = props;

  const [dailyDoubleScreenPresented, setDailyDoubleScreenPresented] =
    useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", clueKeyPress);
    return () => {
      document.removeEventListener("keydown", clueKeyPress);
    };
  });

  // Add click listeners to images in clue displays
  useEffect(() => {
    const images = document.querySelectorAll(".clue-display img");
    const handleImageClick = (event: Event) => {
      event.stopPropagation(); // Prevent triggering clue click
      const img = event.target as HTMLImageElement;
      setCurrentImage(img.src);
      setShowImageModal(true);
    };

    images.forEach((img) => {
      img.addEventListener("click", handleImageClick);
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("click", handleImageClick);
      });
    };
  }, [currentCategory, currentClue, dailyDoubleScreenPresented]);

  function renderCategory(index: number) {
    return (
      <div onClick={categoryShown} className="category-container">
        <TransitionGroup>
          <CSSTransition key={index} timeout={1000} classNames="categorybox">
            <div className="category-box">
              <div className="category">{board[index].category}</div>
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
    );
  }

  function renderClue(categoryName: string, clue: Clue, value: number) {
    const showDailyDoubleScreen =
      clue.dailyDouble && !dailyDoubleScreenPresented;

    return (
      <div
        onClick={showDailyDoubleScreen ? switchDDToClue : undefined}
        className="clue"
      >
        <div className="clue-category-label">
          <img src="/spr-logo.png" alt="SPR Logo" className="clue-logo" />
          {categoryName} - ${clue.value}
        </div>
        <div
          className={
            showDailyDoubleScreen ? "clue-display daily-double" : "clue-display"
          }
        >
          <br />
          {showDailyDoubleScreen ? (
            "Daily Double"
          ) : clue.html === true ? (
            <div
              dangerouslySetInnerHTML={{
                __html: clue.clue,
              }}
            />
          ) : (
            clue.clue
          )}
        </div>
        {!showDailyDoubleScreen && (
          <div className="clue-controls">
            <button onClick={goBackToBoard} className="clue-button go-back-btn">
              ← Go Back
            </button>
            <button onClick={closeQuestion} className="clue-button close-btn">
              Close Question
            </button>
          </div>
        )}
      </div>
    );
  }

  function clueKeyPress(event: KeyboardEvent) {
    // Handle escape key for image modal first
    if (event.key === "Escape" && showImageModal) {
      closeImageModal();
      return;
    }

    // First check for categoriesShown
    if (
      categoriesShown < board.length &&
      (event.key === " " || event.key === "Enter")
    ) {
      categoryShown();
      return; // Prevent further processing
    }

    if (currentCategory === null || currentClue === null) {
      return;
    }
    const clue = board[currentCategory].clues[currentClue];

    if (event.key === " ") {
      // If we just showed the Daily Double screen, switch to the clue
      if (clue.dailyDouble && !dailyDoubleScreenPresented) {
        switchDDToClue();
      }
    } else if (event.key === "Enter") {
      // If Daily Double screen is showing, advance to clue, otherwise close question
      if (clue.dailyDouble && !dailyDoubleScreenPresented) {
        switchDDToClue();
      } else {
        closeQuestion();
      }
    } else if (event.key === "Escape") {
      goBackToBoard();
    }
  }

  function switchDDToClue() {
    setDailyDoubleScreenPresented(true);
  }

  function goBackToBoard() {
    setDailyDoubleScreenPresented(false);
    backToBoard();
  }

  function closeQuestion() {
    if (currentCategory !== null && currentClue !== null) {
      closeClue(currentCategory, currentClue);
    }
    setDailyDoubleScreenPresented(false);
  }

  function openHelpModal() {
    setShowHelpModal(true);
  }

  function closeHelpModal() {
    setShowHelpModal(false);
  }

  function closeImageModal() {
    setShowImageModal(false);
    setCurrentImage("");
  }

  function toggleMenu() {
    setShowMenu(!showMenu);
  }

  function renderHelpModal() {
    if (!showHelpModal) return null;

    return (
      <div className="help-modal-overlay" onClick={closeHelpModal}>
        <div className="help-modal" onClick={(e) => e.stopPropagation()}>
          <div className="help-modal-header">
            <h2>🎮 Game Controls</h2>
            <button className="help-close-btn" onClick={closeHelpModal}>
              ×
            </button>
          </div>
          <div className="help-modal-content">
            <div className="help-section">
              <h3>🎯 Playing the Game</h3>
              <ul>
                <li>Click on a category to reveal it</li>
                <li>Click on dollar amounts to select questions</li>
                <li>
                  Press <kbd>Space</kbd> to advance through Daily Double screens
                </li>
                <li>
                  Press <kbd>Esc</kbd> to go back (keeps question active)
                </li>
                <li>
                  Press <kbd>Enter</kbd> to close question (removes from board)
                </li>
              </ul>
            </div>

            <div className="help-section">
              <h3>🏆 Scoring (Keyboard Shortcuts)</h3>
              <div className="help-scoring">
                <div className="help-correct">
                  <h4>✅ Correct Answers</h4>
                  <div className="key-row">
                    <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>{" "}
                    <kbd>5</kbd> <kbd>6</kbd> <kbd>7</kbd> <kbd>8</kbd>{" "}
                    <kbd>9</kbd>
                  </div>
                  <p>
                    Press number keys for each player (Player 1 = <kbd>1</kbd>,
                    etc.)
                  </p>
                </div>

                <div className="help-incorrect">
                  <h4>❌ Incorrect Answers</h4>
                  <div className="key-row">
                    <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd>{" "}
                    <kbd>T</kbd> <kbd>Y</kbd> <kbd>U</kbd> <kbd>I</kbd>{" "}
                    <kbd>O</kbd>
                  </div>
                  <p>
                    Press QWERTY row keys for each player (Player 1 ={" "}
                    <kbd>Q</kbd>, etc.)
                  </p>
                </div>
              </div>
            </div>

            <div className="help-section">
              <h3>💰 Daily Doubles & Final Jeopardy</h3>
              <ul>
                <li>Enter wager amounts in the input boxes</li>
                <li>Keyboard shortcuts work with wagered amounts</li>
                <li>
                  Press <kbd>Space</kbd> to advance through Daily Double screens
                </li>
              </ul>
            </div>

            <div className="help-section">
              <h3>🔄 Question Management</h3>
              <ul>
                <li>
                  <strong>Go Back:</strong> Click "← Go Back" or press{" "}
                  <kbd>Esc</kbd> to return to board (keeps question active)
                </li>
                <li>
                  <strong>Close Question:</strong> Click "Close Question" or
                  press <kbd>Enter</kbd> to remove from board
                </li>
                <li>
                  Questions must be deliberately closed - they won't auto-close
                </li>
              </ul>
            </div>

            <div className="help-section">
              <h3>🔄 Game Management</h3>
              <ul>
                <li>
                  <strong>💾 Download:</strong> Save game progress (bottom
                  right)
                </li>
                <li>
                  <strong>🔄 Restart:</strong> Start over with new questions
                  (bottom left)
                </li>
                <li>
                  <strong>⬇️ Sample Game:</strong> Download template (GameLoader
                  screen)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderImageModal() {
    if (!showImageModal || !currentImage) return null;

    return (
      <div className="image-modal-overlay" onClick={closeImageModal}>
        <div className="image-modal" onClick={(e) => e.stopPropagation()}>
          <button className="image-close-btn" onClick={closeImageModal}>
            ×
          </button>
          <img
            src={currentImage}
            alt="Fullscreen view"
            className="fullscreen-image"
            onClick={closeImageModal}
          />
        </div>
      </div>
    );
  }

  // First check for if we need to present categories
  if (categoriesShown < board.length) {
    return renderCategory(categoriesShown);
  }

  // Check if there is a clue to present
  if (currentCategory !== null && currentClue !== null) {
    return (
      <>
        {renderClue(
          board[currentCategory].category,
          board[currentCategory].clues[currentClue],
          board[currentCategory].clues[currentClue].value
        )}
        <button className="menu-toggle" onClick={toggleMenu} title="Menu">
          ☰
        </button>
        {showMenu && (
          <div className="menu-dropdown">
            <button onClick={openHelpModal} className="menu-item">
              ❓ Help
            </button>
            <button onClick={downloadGame} className="menu-item">
              💾 Backup
            </button>
            <button onClick={restartGame} className="menu-item">
              🔄 Restart
            </button>
          </div>
        )}
        {renderHelpModal()}
        {renderImageModal()}
      </>
    );
  }

  return (
    <>
      <div>
        <table>
          <thead>
            <tr>
              {board.map((category, i) => (
                <td key={i} className="category-title">
                  {category.category}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {board[0].clues.map((_, j) => {
              return (
                <tr key={j}>
                  {board.map((category, i) => {
                    if (category.clues[j].chosen) {
                      return <td key={i} className="board-clue"></td>;
                    }
                    return (
                      <td
                        key={i}
                        onClick={() => chooseClue(i, j)}
                        className="board-clue"
                      >
                        ${category.clues[j].value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="menu-toggle" onClick={toggleMenu} title="Menu">
        ☰
      </button>
      {showMenu && (
        <div className="menu-dropdown">
          <button onClick={openHelpModal} className="menu-item">
            ❓ Help
          </button>
          <button onClick={downloadGame} className="menu-item">
            💾 Backup
          </button>
          <button onClick={restartGame} className="menu-item">
            🔄 Restart
          </button>
        </div>
      )}
      {renderHelpModal()}
      {renderImageModal()}
    </>
  );
}

export default JeopardyBoard;
