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
    topBar.style.top = `${barPositions.top.current}px`;
    
    // set bottom bar position
    bottomBar.style.top = `${barPositions.bottom.current}px`;
  }
  
  function addBarInteractivity() {
    // mouse
    let draggedBar = null;
    let relativeY = null;
    function mouseDown(event) {
      // get current bar positions
      const topBarTop = barPositions.top.current;
      const topBarBottom = topBarTop + barPositions.top.height;
      const bottomBarTop = barPositions.bottom.current;
      const bottomBarBottom = bottomBarTop + barPositions.bottom.height;
      
      // check which bar was clicked
      if (event.clientY >= topBarTop && event.clientY <= topBarBottom) {
        draggedBar = "top";
      } else if (event.clientY >= bottomBarTop && event.clientY <= bottomBarBottom) {
        draggedBar = "bottom";
      } else {
        draggedBar = null;
      }
      console.log(draggedBar);
      
      // get relative Y position
      if (draggedBar === "top") {
        relativeY = event.clientY - topBarTop;
      } else if (draggedBar === "bottom") {
        relativeY = event.clientY - bottomBarTop;
      }
      barPositions[draggedBar].status = null;
    }
    function mouseDrag(event) {
      if (draggedBar === null) return;
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
    }
    function mouseUp(event) {
      const currentPosition = barPositions[draggedBar].current;
      
      // check if the bar is more open or closed
      const openPosition = barPositions[draggedBar].openPosition;
      const closedPosition = barPositions[draggedBar].closedPosition;
      
      // get distances
      const distanceToOpen = Math.abs(currentPosition - openPosition);
      const distanceToClosed = Math.abs(currentPosition - closedPosition);
      
      if (distanceToOpen < distanceToClosed) {
        barPositions[draggedBar].status = "open";
      } else {
        barPositions[draggedBar].status = "closed";
      }
      
      draggedBar = null;
    }
    
    document.addEventListener("mousedown", mouseDown);
    document.addEventListener("mousemove", mouseDrag);
    document.addEventListener("mouseup", mouseUp);
  }
  
  function renderLoop() {
    getPositions();
    
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
    if (barPositions.top.status !== null) {
      barPositions.top.current = tween(barPositions.top.current, target, 0.1);
    }
    
    target = null;
    if (barPositions.bottom.status === "closed") {
      target = barPositions.bottom.closedPosition;
    } else if (barPositions.bottom.status === "open") {
      target = barPositions.bottom.openPosition;
    }
    if (barPositions.bottom.status !== null) {
      barPositions.bottom.current = tween(barPositions.bottom.current, target, 0.1);
    }

    positionBars();
    requestAnimationFrame(renderLoop);
  }
  getPositions();
  barPositions.top.current = barPositions.top.closedPosition;
  barPositions.bottom.current = barPositions.bottom.closedPosition;
  requestAnimationFrame(renderLoop);
  
  addBarInteractivity();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}