const textInput = document.getElementById("textInput");
const applyBtn = document.getElementById("applyBtn");
const output = document.getElementById("output");
let isSelected = false;
let selectionBox = null;
let startX = 0;
let startY = 0;
let dragging = false;
let selectedChars = [];
let draggedChar = null;
let draggedCharOriginalPosition = { left: 0, top: 0 };

// display of entered text
applyBtn.addEventListener("click", () => {
  output.innerHTML = "";
  const text = textInput.value.split("");
  text.forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.classList.add("draggable");
    span.setAttribute("data-index", index);
    span.setAttribute("draggable", true);
    output.appendChild(span);
  });
});

// characters selection
output.addEventListener("click", (event) => {
  if (event.target.classList.contains("draggable")) {
    if (event.ctrlKey) {
      event.target.classList.toggle("selected");
    } else {
      clearSelection();
      event.target.classList.add("selected");
    }
    updateSelectionState();
  }
});

// logic for creating a selection rectangle
output.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;
  if (event.target.classList.contains("selected")) {
    dragging = true;
    return;
  }
  if (!event.ctrlKey) {
    event.preventDefault();
    startX = event.clientX;
    startY = event.clientY;

    selectionBox = document.createElement("div");
    selectionBox.classList.add("selection-box");
    document.body.appendChild(selectionBox);

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
});

function onMouseMove(event) {
  const currentX = event.clientX;
  const currentY = event.clientY;

  selectionBox.style.width = `${Math.abs(currentX - startX)}px`;
  selectionBox.style.height = `${Math.abs(currentY - startY)}px`;

  selectionBox.style.left = `${Math.min(currentX, startX)}px`;
  selectionBox.style.top = `${Math.min(currentY, startY)}px`;
}

function onMouseUp() {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  selectCharsInBox(selectionBox);
  document.body.removeChild(selectionBox);
  selectionBox = null;
  updateSelectionState();
}

function selectCharsInBox(box) {
  const boxRect = box.getBoundingClientRect();
  const chars = document.querySelectorAll(".draggable");

  chars.forEach((char) => {
    const charRect = char.getBoundingClientRect();
    if (
      charRect.left < boxRect.right &&
      charRect.right > boxRect.left &&
      charRect.top < boxRect.bottom &&
      charRect.bottom > boxRect.top
    ) {
      char.classList.add("selected");
    }
  });
}

function updateSelectionState() {
  const selectedChars = document.querySelectorAll(".selected");
  isSelected = selectedChars.length > 0;
}

function clearSelection() {
  document.querySelectorAll(".draggable").forEach((span) => {
    span.classList.remove("selected");
  });
  isSelected = false;
}

// Add Drag and Drop for a group or a single character
output.addEventListener("dragstart", (event) => {
  if (event.target.classList.contains("selected")) {
    selectedChars = Array.from(document.querySelectorAll(".selected"));

    if (selectedChars.length > 1) {
      selectedChars.forEach((char) => {
        char.classList.add("dragging");
        char.dataset.originalLeft = char.style.left || `${char.offsetLeft}px`;
        char.dataset.originalTop = char.style.top || `${char.offsetTop}px`;
      });
      dragging = true;
    } else {
      draggedChar = event.target;
      draggedCharOriginalPosition = {
        left: draggedChar.offsetLeft,
        top: draggedChar.offsetTop,
      };
    }

    event.dataTransfer.setDragImage(document.createElement("div"), 0, 0);
  }
});

output.addEventListener("dragend", (event) => {
  selectedChars.forEach((char) => char.classList.remove("dragging"));
  dragging = false;
});

document.body.addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.body.addEventListener("drop", (event) => {
  event.preventDefault();

  const dropX = event.clientX;
  const dropY = event.clientY;

  if (selectedChars.length === 1) {
    const targetChar = document.elementFromPoint(dropX, dropY);

    if (
      targetChar &&
      targetChar.classList.contains("draggable") &&
      targetChar !== draggedChar
    ) {
      const targetCharPosition = {
        left: targetChar.offsetLeft,
        top: targetChar.offsetTop,
      };

      draggedChar.style.position = "absolute";
      draggedChar.style.left = `${targetCharPosition.left}px`;
      draggedChar.style.top = `${targetCharPosition.top}px`;

      targetChar.style.position = "absolute";
      targetChar.style.left = `${draggedCharOriginalPosition.left}px`;
      targetChar.style.top = `${draggedCharOriginalPosition.top}px`;
    } else {
      draggedChar.style.position = "absolute";
      draggedChar.style.left = `${dropX}px`;
      draggedChar.style.top = `${dropY}px`;
    }
  } else if (selectedChars.length > 1) {
    selectedChars.forEach((char, index) => {
      char.style.position = "absolute";
      char.style.left = `${dropX + index * 40}px`;
      char.style.top = `${dropY}px`;
    });
  }

  selectedChars = [];
  draggedChar = null;
});
