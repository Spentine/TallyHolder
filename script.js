// handle local storage
function generateRandomId() {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
  const length = 16;
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function newLocalStorageSettings(settings={
  count: 0,
  increment: 1,
  decrement: 1,
  name: null
}) {
  const storage = localStorage.getItem("tallyHolder");
  const storageObject = JSON.parse(storage);
  const id = generateRandomId();
  
  if (settings.name === null) {
    settings.name = "Tally " + id.substring(0, 6);
  }
  
  storageObject[id] = settings;
  localStorage.setItem("tallyHolder", JSON.stringify(storageObject));
  return id;
}

function deleteTally(id) {
  const storage = localStorage.getItem("tallyHolder");
  const storageObject = JSON.parse(storage);
  if (!storageObject.hasOwnProperty(id)) {
    return false; // invalid id
  }
  delete storageObject[id];
  localStorage.setItem("tallyHolder", JSON.stringify(storageObject));
  return true;
}

function initLocalStorage() {
  if (localStorage.getItem("tallyHolder") === null) {
    localStorage.setItem("tallyHolder", JSON.stringify({}));
  }
  let storage = JSON.parse(localStorage.getItem("tallyHolder"));
  if (Object.keys(storage).length === 0) {
    newLocalStorageSettings();
  }
  storage = JSON.parse(localStorage.getItem("tallyHolder"));
  const id = Object.keys(storage)[0];
  return id;
}

function loadLocalStorage(id) {
  const storage = localStorage.getItem("tallyHolder");
  const storageObject = JSON.parse(storage);
  const settings = storageObject[id];
  return settings;
}

function saveLocalStorage(settings, id) {
  const storage = localStorage.getItem("tallyHolder");
  if (storage === null) {
    return false; // no storage
  }
  const storageObject = JSON.parse(storage);
  if (!storageObject.hasOwnProperty(id)) {
    return false; // invalid id
  }
  storageObject[id] = settings;
  localStorage.setItem("tallyHolder", JSON.stringify(storageObject));
  return true;
}

function main() {
  console.log("Script loaded successfully");
  
  // elements
  
  const topBar = document.getElementById("top");
  const bottomBar = document.getElementById("bottom");
  
  const tallyElement = document.getElementById("tally");
  const countElement = document.getElementById("tally-count");
  
  const countInput = document.getElementById("countInput");
  const incrementInput = document.getElementById("incrementInput");
  const decrementInput = document.getElementById("decrementInput");
  const nameInput = document.getElementById("nameInput");
  
  const title = document.getElementById("title");
  
  const tallySelect = document.getElementById("tallySelect");
  const tallyNew = document.getElementById("tallyNew");
  const tallyDelete = document.getElementById("tallyDelete");
  
  // variables
  
  let tallyCount = 0;
  let tallyIncrement = 1; // default increment value
  let tallyDecrement = 1; // default decrement value
  let tallyName = "Tally"; // default name for the tally
  let currentSettingsId = null;
  
  const barPositions = {
    top: {
      closedPosition: null,
      openPosition: null,
      height: null,
      dragHeight: null,
      status: "closed",
      current: null,
    },
    bottom: {
      closedPosition: null,
      openPosition: null,
      height: null,
      dragHeight: null,
      status: "closed",
      current: null,
    }
  }
  
  const getWidth = function() {
    return document.body.clientWidth || window.innerWidth;
  };
  const getHeight = function() {
    return document.body.clientHeight || window.innerHeight;
  };
  
  // localstorage
  
  let id = initLocalStorage();
  let settings = loadLocalStorage(id);
  loadSettings(settings);
  currentSettingsId = id;
  
  function loadSettings(settings) {
    tallyCount = settings.count || 0;
    tallyIncrement = settings.increment || 1;
    tallyDecrement = settings.decrement || 1;
    tallyName = settings.name || "Tally";
    
    updateCount(tallyCount, false);
    incrementInput.value = tallyIncrement;
    decrementInput.value = tallyDecrement;
    nameInput.value = tallyName;
  }
  
  function saveSettings() {
    const settings = {
      count: tallyCount,
      increment: tallyIncrement,
      decrement: tallyDecrement,
      name: tallyName
    };
    
    if (currentSettingsId === null) {
      currentSettingsId = newLocalStorageSettings(settings);
    } else {
      saveLocalStorage(settings, currentSettingsId);
    }
  }
  
  function valueUpdated() {
    saveSettings();
  }
  
  function updateTallySelect() {
    // clear existing options
    while (tallySelect.firstChild) {
      tallySelect.removeChild(tallySelect.firstChild);
    }
    
    // get storage
    const storage = JSON.parse(localStorage.getItem("tallyHolder"));
    const pairs = Object.entries(storage);
    console.log(pairs);
    
    // create options
    pairs.forEach(([id, settings]) => {
      console.log(settings.name);
      const option = document.createElement("option");
      option.value = id;
      option.textContent = `${settings.name}`;
      tallySelect.appendChild(option);
    });
    
    // select current settings
    if (currentSettingsId !== null) {
      tallySelect.value = currentSettingsId;
    } else {
      tallySelect.value = pairs[0][0]; // select first option if no current settings
    }
  }
  
  function getPositions() {
    // get viewport height
    const viewportHeight = getHeight();

    // get rects
    const topBarRect = topBar.getBoundingClientRect();
    const bottomBarRect = bottomBar.getBoundingClientRect();
    const topBarDragRect = topBar.querySelector(".drag").getBoundingClientRect();
    const bottomBarDragRect = bottomBar.querySelector(".drag").getBoundingClientRect();
    
    // set dimensions
    barPositions.top.height = topBarRect.height;
    barPositions.bottom.height = bottomBarRect.height;
    barPositions.top.dragHeight = topBarDragRect.height;
    barPositions.bottom.dragHeight = bottomBarDragRect.height;
    
    // set closed positions
    barPositions.top.closedPosition = topBarDragRect.height - topBarRect.height;
    barPositions.bottom.closedPosition = viewportHeight - bottomBarDragRect.height;
    
    // set open positions
    barPositions.top.openPosition = 0;
    barPositions.bottom.openPosition = viewportHeight - bottomBarRect.height;
  }
  
  function positionBars() {
    // set top bar position
    topBar.style.top = `${barPositions.top.current}px`;
    
    // set bottom bar position
    bottomBar.style.top = `${barPositions.bottom.current}px`;
  }
  
  function resizeCount() {
    // resize text to fit screen
    const countWidth = countElement.getBoundingClientRect().width;
    const viewportWidth = getWidth();
    const viewportHeight = getHeight();
    const widthRatio = viewportWidth / countWidth;
    const currentFontSize = parseFloat(getComputedStyle(countElement).fontSize);
    const newFontSize = Math.min(
      currentFontSize * widthRatio,
      viewportWidth * 0.8,
      viewportHeight * 0.6
    );
    countElement.style.fontSize = `${newFontSize}px`;
  }
  
  function updateCount(count, forceUpdate=true) {
    tallyCount = count;
    countElement.textContent = tallyCount;
    countInput.value = tallyCount;
    title.textContent = tallyCount + " | " + tallyName;
    resizeCount();
    if (forceUpdate) valueUpdated();
  }
  
  function addInteractivity() {
    
    // mouse
    let dragType = null;
    let dragOriginalStatus = null;
    let dragStartTime = null;
    let draggedBar = null;
    let relativeY = null;
    let swipeStartY = null;
    function mouseDown(event, type="mouse") {
      // get current bar positions
      const topBarTop = (
        barPositions.top.current +
        barPositions.top.height -
        barPositions.top.dragHeight
      );
      const topBarBottom = barPositions.top.current + barPositions.top.height;
      const bottomBarTop = barPositions.bottom.current;
      const bottomBarBottom = bottomBarTop + barPositions.bottom.dragHeight;
      
      // check which bar was clicked
      if (event.clientY >= topBarTop && event.clientY <= topBarBottom) {
        draggedBar = "top";
      } else if (event.clientY >= bottomBarTop && event.clientY <= bottomBarBottom) {
        draggedBar = "bottom";
      } else if (event.clientY >= topBarBottom && event.clientY <= bottomBarTop) {
        draggedBar = "tally"; // not dragging a bar, just tally functionality
      } else {
        draggedBar = null; // not dragging a bar
      }
      
      // tally functionality
      if (draggedBar === "tally") {
        swipeStartY = event.clientY;
        dragStartTime = Date.now();
        return;
      }
      
      if (draggedBar === null) return;
      
      // get relative Y position
      if (draggedBar === "top") {
        relativeY = event.clientY - barPositions.top.current;
      } else if (draggedBar === "bottom") {
        relativeY = event.clientY - barPositions.bottom.current;
      }
      
      dragOriginalStatus = barPositions[draggedBar].status;
      dragStartTime = Date.now();
      dragType = type;
      
      barPositions[draggedBar].status = null;
    }
    function mouseDrag(event, type="mouse") {
      if (draggedBar === "tally") return;
      if (draggedBar === null) return; // not dragging a bar
      if (dragType !== type) return; // only allow dragging if the type matches
      // get min and max positions
      const min = Math.min(
        barPositions[draggedBar].closedPosition,
        barPositions[draggedBar].openPosition
      );
      const max = Math.max(
        barPositions[draggedBar].closedPosition,
        barPositions[draggedBar].openPosition
      );

      barPositions[draggedBar].current = Math.min(
        Math.max(event.clientY - relativeY, min),
        max
      );
      
      // close opposite bar if it's too close
      const changeDistance = 16;
      const distance = (
        barPositions.bottom.current // top of bottom bar
        - (barPositions.top.current + barPositions.top.height) // bottom of top bar
      );
      if (draggedBar === "top") {
        if (barPositions.bottom.status !== "closed") {
          barPositions.bottom.status = "non-move open"; // open but don't move it
          barPositions.bottom.current = Math.max(
            Math.min(
              (barPositions.top.current + barPositions.top.height) + changeDistance,
              barPositions.bottom.closedPosition
            ),
            barPositions.bottom.openPosition
          );
        }
      } else if (draggedBar === "bottom") {
        if (barPositions.top.status !== "closed") {
          barPositions.top.status = "non-move open"; // open but don't move it
          barPositions.top.current = Math.min(
            Math.max(
              barPositions.bottom.current - changeDistance - barPositions.top.height,
              barPositions.top.closedPosition
            ),
            barPositions.top.openPosition
          );
        }
      }
    }
    /**
     * this will have interesting functionality
     * if the amount of time the bar was dragged is less than 200ms:
     *   it will toggle the bar status
     * if the amount of time is more than 200ms:
     *   it will set the bar status to open or closed depending on the position
     */
    function mouseUp(event, type="mouse") {
      if (draggedBar === null) return; // not dragging a bar
      
      // tally functionality
      if (draggedBar === "tally") {
        if (swipeStartY === null) return;
        
        const swipeEndY = event.clientY;
        const swipeDuration = Date.now() - dragStartTime;
        
        if (type === "mouse" && swipeDuration < 5) {
          // broken browser behavior, just ignore
          return;
        }
        
        // check if it was a click
        if (swipeDuration < 200 && Math.abs(swipeEndY - swipeStartY) < 10) {
          tallyCount += tallyIncrement;
        } else {
          // check if it was a swipe up or down
          if (swipeEndY < swipeStartY + 10) {
            // swipe up
            tallyCount += tallyIncrement;
          } else {
            // swipe down
            tallyCount -= tallyDecrement;
          }
        }
        
        updateCount(tallyCount);
        
        swipeStartY = null; // reset
        return; // not dragging a bar, just return
      };
      if (dragType !== type) return; // only allow dragging if the type matches
      
      const dragDuration = Date.now() - dragStartTime;
      if (type === "mouse" && dragDuration < 5) { // broken browser behavior
        // untoggle the mouse toggle
        barPositions[draggedBar].status = dragOriginalStatus;
      } else if (dragDuration < 200) { // quick drag
        barPositions[draggedBar].status = dragOriginalStatus === "open" ? "closed" : "open";
      } else { // long drag
        const currentPosition = barPositions[draggedBar].current;
        
        // check if the bar is more open or closed
        const openPosition = barPositions[draggedBar].openPosition;
        const closedPosition = barPositions[draggedBar].closedPosition;
        
        // get distances
        let distanceToOpen = Math.abs(currentPosition - openPosition);
        let distanceToClosed = Math.abs(currentPosition - closedPosition);
        
        const weight = 4;
        if (dragOriginalStatus === "open") {
          // weight closed position more
          distanceToClosed /= weight;
        } else if (dragOriginalStatus === "closed") {
          // weight open position more
          distanceToOpen /= weight;
        }
        
        if (distanceToOpen < distanceToClosed) {
          barPositions[draggedBar].status = "open";
        } else {
          barPositions[draggedBar].status = "closed";
        }
      }
      
      if (draggedBar === "top" && barPositions.bottom.status !== "closed") {
        barPositions.bottom.status = (
          barPositions.top.status === "open" ? "closed" : "open"
        );
      } else if (draggedBar === "bottom" && barPositions.top.status !== "closed") {
        barPositions.top.status = (
          barPositions.bottom.status === "open" ? "closed" : "open"
        );
      }
      
      draggedBar = null;
    }
    document.addEventListener("mousedown", mouseDown);
    document.addEventListener("mousemove", mouseDrag);
    document.addEventListener("mouseup", mouseUp);
    
    // touch (temporary one finger only touch)
    // it just forwards it to the mouse events
    function touchDown(event) {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        mouseDown(mouseEvent, "touch");
        if (draggedBar !== null) {
          event.preventDefault(); // prevent default touch behavior
        }
      }
    }
    function touchDrag(event) {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        mouseDrag(mouseEvent, "touch");
        if (draggedBar !== null) {
          event.preventDefault(); // prevent default touch behavior
        } 
      }
    }
    function touchUp(event) {
      const touch = event.changedTouches[0];
      const mouseEvent = new MouseEvent("mouseup", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      mouseUp(mouseEvent, "touch");
    }
    document.addEventListener("touchstart", touchDown);
    document.addEventListener("touchmove", touchDrag);
    document.addEventListener("touchend", touchUp);
    
    // keyboard
    document.addEventListener("keydown", (event) => {
      // check if there is a selection
      const selection = window.getSelection();
      if (selection.focusNode) return; // the user is probably typing in an input field
      
      if (
        event.key === "ArrowUp" ||
        event.key === " " ||
        event.key === "Enter" ||
        event.key === "w"
      ) {
        tallyCount += tallyIncrement;
        updateCount(tallyCount);
      } else if (
        event.key === "ArrowDown" ||
        event.key === "Backspace" ||
        event.key === "s"
      ) {
        tallyCount -= tallyDecrement;
        updateCount(tallyCount);
      }
    });
    
    // add interactivity for inputs
    
    countInput.addEventListener("change", (event) => {
      const value = parseFloat(event.target.value, 10);
      if (!isNaN(value)) {
        tallyCount = value;
        updateCount(tallyCount);
      } else {
        updateCount(tallyCount); // reset to current count if invalid input
      }
    });
    
    incrementInput.addEventListener("change", (event) => {
      const value = parseFloat(event.target.value, 10);
      if (!isNaN(value) && value > 0) {
        tallyIncrement = value;
        valueUpdated();
      } else {
        incrementInput.value = tallyIncrement;
      }
    });
    
    decrementInput.addEventListener("change", (event) => {
      const value = parseFloat(event.target.value, 10);
      if (!isNaN(value) && value > 0) {
        tallyDecrement = value;
        valueUpdated();
      } else {
        decrementInput.value = tallyDecrement;
      }
    });
    
    nameInput.addEventListener("change", (event) => {
      const value = event.target.value.trim();
      if (value.length > 0) {
        tallyName = value;
        valueUpdated();
        title.textContent = tallyCount + " | " + tallyName;
        
        // find the current option in the select
        const currentOption = Array.from(tallySelect.options).find(option => option.value === currentSettingsId);
        if (currentOption) {
          currentOption.textContent = tallyName; // update the option text
        }
      } else {
        nameInput.value = tallyName; // reset to current name if invalid input
      }
    });
    
    tallySelect.addEventListener("change", (event) => {
      const selectedId = event.target.value;
      if (selectedId === currentSettingsId) return; // no change
      
      // save current settings
      saveSettings();
      
      // load new settings
      const newSettings = loadLocalStorage(selectedId);
      loadSettings(newSettings);
      currentSettingsId = selectedId;
    });
    
    tallyNew.addEventListener("click", () => {
      // save current settings
      saveSettings();
      
      // create new settings
      const newId = newLocalStorageSettings();
      currentSettingsId = newId;
      
      const settings = loadLocalStorage(newId);
      loadSettings(settings);
      
      // update select
      updateTallySelect();
    });
    
    tallyDelete.addEventListener("click", () => {
      // alert
      if (
        !confirm(
          "Are you sure you want to delete this tally? This action cannot be undone."
        )
      ) {
        return; // user cancelled
      }
      
      // delete
      deleteTally(currentSettingsId);
      const storage = JSON.parse(localStorage.getItem("tallyHolder"));
      if (Object.keys(storage).length === 0) {
        // no more tallies, create a new one
        currentSettingsId = newLocalStorageSettings();
      } else {
        // select the first tally
        currentSettingsId = Object.keys(storage)[0];
      }
      const settings = loadLocalStorage(currentSettingsId);
      loadSettings(settings);
      updateTallySelect();
    });
  }
  
  let lastFrame = Date.now();
  
  function renderLoop() {
    const fps = 1 / (Date.now() - lastFrame) * 1000;
    lastFrame = Date.now();
    
    getPositions();
    
    // frame rate correction
    const topPortion = 1 - Math.pow(0.00001, (1/fps));
    const bottomPortion = 1 - Math.pow(0.001, (1/fps));
    
    const tween = function(current, target, portion) {
      return current * (1 - portion) + target * portion;
    };
    
    let target;
    target = null;
    if (barPositions.top.status === "closed") {
      target = barPositions.top.closedPosition;
    } else if (barPositions.top.status === "open") {
      target = barPositions.top.openPosition;
    }
    if (target !== null) {
      barPositions.top.current = tween(barPositions.top.current, target, topPortion);
    }
    
    target = null;
    if (barPositions.bottom.status === "closed") {
      target = barPositions.bottom.closedPosition;
    } else if (barPositions.bottom.status === "open") {
      target = barPositions.bottom.openPosition;
    }
    if (target !== null) {
      barPositions.bottom.current = tween(barPositions.bottom.current, target, bottomPortion);
    }
    
    resizeCount();

    positionBars();
    requestAnimationFrame(renderLoop);
    
    window.scrollTo(0, 0); // prevent scrolling
  }
  getPositions();
  barPositions.top.current = barPositions.top.closedPosition;
  barPositions.bottom.current = barPositions.bottom.closedPosition;
  requestAnimationFrame(renderLoop);
  updateCount(tallyCount);
  
  addInteractivity();
  
  updateTallySelect();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}