const addFloor = document.getElementById("add-floor-button");
const floorContainer = document.getElementsByClassName("floor-container");
const initialUpButton = document.getElementsByClassName("0-up");
const initialDownButton = document.getElementsByClassName("0-down");
const initialFloor = document.getElementById("0-floor");
const lift = document.getElementsByClassName("lift");
const upButtons = document.getElementsByClassName("up-listener");
const downButtons = document.getElementsByClassName("down-listener");
const liftButton = document.getElementById("add-lift-button");

let liftCount = 0;
const queue = [];
const liftDetails = [{ liftId: 0, busyStatus: false, floorNo: 0 }];

liftButton.addEventListener("click", addLift);

addFloor.addEventListener("click", () => {
	addNewFloor();
});

initialUpButton[0].addEventListener("click", () => moveLift(0, "up"));
initialDownButton[0].addEventListener("click", () => moveLift(0, "down"));

function addListener(element) {
	const id = parseInt(element.id);
	upButtons[0].addEventListener("click", () => moveLift(id, "up"));
	downButtons[0].addEventListener("click", () => moveLift(id, "down"));
}

function addNewFloor() {
	const singleFloor = document.createElement("div");
	singleFloor.classList.add("single-floor");
	singleFloor.id = `${floorContainer[0].childElementCount}`;
	singleFloor.innerHTML = `
  <img
						src="./src/arrow.svg"
						alt=""
						class="button-width up-listener"
						id=${floorContainer[0].childElementCount + ""}
					/>
					<img
						src="./src/arrow.svg"
						alt=""
						class="button-width down-listener"
						id=${floorContainer[0].childElementCount + ""}
					/>`;
	floorContainer[0].insertBefore(singleFloor, floorContainer[0].children[0]);
	addListener(singleFloor);
}

function addLift() {
	if (
		(window.screen.width < 800 && liftDetails.length < 5) ||
		(window.screen.width > 800 && liftDetails.length < 12)
	) {
		const singleLift = document.createElement("div");
		singleLift.classList.add("lift");
		singleLift.innerHTML = `<div class=" door-width"></div>
    <div class="door-width"></div>`;
		initialFloor.appendChild(singleLift);
		liftCount += 1;
		liftDetails.push({ liftId: liftCount, busyStatus: false, floorNo: 0 });
	} else {
		liftButton.disabled = true;
		liftButton.style.opacity = "0.5";
		liftButton.innerText = "Max Lifts added!";
	}
}

function moveLift(id, buttonClicked) {
	let flag = true;
	for (let i = 0; i < liftDetails.length; i++) {
		if (liftDetails[i].floorNo === id && liftDetails[i].busyStatus === true) {
			flag = false;
		}
	}
	if (flag) {
		queue.push(id);
		changeActiveButtonColor(buttonClicked, id);
		handleQueueRequests(id);
	}
}

function handleQueueRequests(id) {
	const moveLiftNumber = nonBusyLift(id);
	if (moveLiftNumber !== null && moveLiftNumber[0] !== null) {
		lift[moveLiftNumber[0]].style.marginBottom = `${id * 200}px`;
		setTimeout(() => {
			lift[moveLiftNumber[0]].children[0].classList.add("lift-door-left");
			lift[moveLiftNumber[0]].children[1].classList.add("lift-door-right");
		}, moveLiftNumber[1] + 1000);
		setTimeout(() => {
			lift[moveLiftNumber[0]].children[0].classList.remove("lift-door-left");
			lift[moveLiftNumber[0]].children[1].classList.remove("lift-door-right");
		}, moveLiftNumber[1] + 3000);
	}
}

function nonBusyLift(id) {
	const alreadyAvailableLift = checkAlreadyAvailableLiftInThatFloor(id);
	if (alreadyAvailableLift !== null) {
		return alreadyAvailableLift;
	}
	return checkAvailableLift(id);
}

function changeActiveButtonColor(buttonClicked, id) {
	if (buttonClicked === "up") {
		upButtons[upButtons.length - id - 1].style.backgroundColor = "orange";
	} else {
		downButtons[downButtons.length - id - 1].style.backgroundColor = "orange";
	}
}

function resetActiveButtonColor(id) {
	upButtons[upButtons.length - id - 1].style.backgroundColor = "grey";
	downButtons[downButtons.length - id - 1].style.backgroundColor = "grey";
}

function checkAvailableLift(id) {
	let nearestLift = Number.MAX_SAFE_INTEGER;
	let nearestLiftAtIndex = null;
	let floorDifference = null;
	for (let i = 0; i < liftDetails.length; i++) {
		floorDifference = Math.abs(id - liftDetails[i].floorNo);
		if (
			!liftDetails[i].busyStatus &&
			floorDifference < nearestLift &&
			liftDetails[i].floorNo !== id
		) {
			nearestLift = floorDifference;
			nearestLiftAtIndex = i;
		}
	}
	if (nearestLiftAtIndex !== null) {
		liftDetails[nearestLiftAtIndex].busyStatus = true;
		liftDetails[nearestLiftAtIndex].floorNo = id;
		queue.splice(0, 1);
		lift[nearestLiftAtIndex].style.transition = `margin ${
			floorDifference * 2000 + "ms"
		}`;
		setTimeout(() => {
			liftDetails[nearestLiftAtIndex].busyStatus = false;
			resetActiveButtonColor(id);
			if (queue.length > 0) {
				handleQueueRequests(queue[0]);
			}
		}, floorDifference * 2000 + 3000);
		return [nearestLiftAtIndex, floorDifference * 2000];
	}
	return null;
}

function checkAlreadyAvailableLiftInThatFloor(id) {
	for (let i = 0; i < liftDetails.length; i++) {
		if (liftDetails[i].floorNo === id && !liftDetails[i].busyStatus) {
			liftDetails[i].busyStatus = true;
			queue.splice(0, 1);
			setTimeout(() => {
				liftDetails[i].busyStatus = false;
				resetActiveButtonColor(id);
				if (queue.length > 0) {
					handleQueueRequests(queue[0]);
				}
			}, 3000);
			return [liftDetails[i].liftId, 0];
		}
	}
	return null;
}
