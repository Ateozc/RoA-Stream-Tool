export function genGuiSection(title, otherElement, placeAfter, newToggles) {

    if (!otherElement) {
        otherElement = document.getElementById('settingsElectron');
    }

    let origDiv = otherElement;

    let titleDiv = "";
    let toggleDivs = [];

    if (title) {
        titleDiv = document.createElement("div");
        titleDiv.className = "settingsTitle";
        titleDiv.innerHTML = title;
        if (placeAfter) {
            origDiv.after(titleDiv);
        } else {
            origDiv.before(titleDiv);
        }
    } else {
        titleDiv = origDiv;
    }

    let prevDiv = titleDiv;

    for (let t = 0; t < newToggles.length; t++) {
        let toggle = newToggles[t];
        let toggleDiv = document.createElement("div");
        toggleDiv.className = "settingBox";

        let inputLabel = document.createElement("label");
        inputLabel.htmlFor = toggle.id;
        inputLabel.className = "settingsText";
        inputLabel.innerHTML = toggle.innerText;

        let toggleInput = genInputBase(toggle);
        
        if (toggle.type == 'button') {
            toggleDiv.appendChild(toggleInput);
        } else if (toggle.type == 'select') {
            
            toggleDiv.title = toggle.title;
            toggleDiv.appendChild(inputLabel);
            toggleDiv.appendChild(toggleInput);
        } else if (toggle.type == 'text') {
            toggleInput.placeholder = toggle.innerText;
            toggleDiv.title = toggle.title;
            toggleDiv.appendChild(toggleInput);
        } else if (toggle.type == 'div') {
            toggleDiv.appendChild(toggleInput);
        } else {
            toggleDiv.title = toggle.title;
            toggleDiv.appendChild(toggleInput);
            toggleDiv.appendChild(inputLabel);
        }

        prevDiv.after(toggleDiv);
        toggleDivs.push(toggleDiv);
        prevDiv = toggleDiv;
    }

    titleDiv.addEventListener('click', () => showHideAllElements(toggleDivs));

    return {
        titleDiv: titleDiv,
        toggleDivs: toggleDivs,
        prevDiv: prevDiv
    }

}

export function showHideAllElements(elements) {
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].style.display == 'none' && !elements[i].disabled) {
            elements[i].style.display = 'flex';
            
        } else {
            elements[i].style.display = 'none';
        }
    }
}

export function showAllElements(elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'flex';
    }
}

export function hideAllElements(elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none';
    }
}

function genInputBase(toggle) {
    let toggleInput = ""; 
    if (toggle.type == 'button') {
        toggleInput = document.createElement("button");
        toggleInput.innerHTML = toggle.innerText;
        toggleInput.title = toggle.title;
    } else if (toggle.type == 'select') {
        toggleInput = document.createElement("select");
        toggleInput.placeholder = toggle.innerText;
        toggleInput.title = toggle.title;
    } else if (toggle.type == 'div') {
        toggleInput = document.createElement("div");
        toggleInput.innerHTML = toggle.innerText;
    } else {
        toggleInput = document.createElement("input");
        toggleInput.type = toggle.type;
    }

    toggleInput.id = toggle.id;
    toggleInput.className = toggle.className;
    toggleInput.tabIndex = "-1";
    toggleInput.disabled = toggle.disabled;

    return toggleInput;
}