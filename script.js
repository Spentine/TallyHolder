function main() {
  console.log("Script loaded successfully");
  
  // elements
  
  const topBar = document.getElementById("top");
  const bottomBar = document.getElementById("bottom");
  
  // variables
  
  const barPositions = {
    top: {
      closedPosition: null,
      openPosition: null,
      height: null,
      dragHeight: null,
    },
    bottom: {
      closedPosition: null,
      openPosition: null,
      height: null,
      dragHeight: null,
    }
  }
  
  function getPositions() {
    // get viewport height
    const viewportHeight = window.innerHeight;
    
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
    topBar.style.top = `${barPositions.top.closedPosition}px`;
    
    // set bottom bar position
    bottomBar.style.top = `${barPositions.bottom.closedPosition}px`;
  }
  
  function renderLoop() {
    getPositions();
    positionBars();
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}