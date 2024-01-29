
class EasyGuiSection {

    /*
    When using sections, it will place the items AFTER the that point.
        Example:
        - If you use top, itll put it at the very top.
        - If you use vsScreen, itll place it after VS Screen
        - If you use settingsElectron, itll place it after the Window Settings section
    */
    #validSections = [
        'top',
        'scoreboard',
        'vsScreen',
        'guiSettings',
        'settingsElectron'//windows settings
    ];


    #sections = {
        top: {
            div: document.getElementById('settingsList'),
            divs: []
        },
        scoreboard: {
            div: this.#getElemForTitleDiv('Scoreboard'),
            divs: []
        },
        vsScreen: {
            div: this.#getElemForTitleDiv('VS Screen'),
            divs: []
        },
        guiSettings: {
            div: this.#getElemForTitleDiv('GUI Settings'),
            divs: []
        },
        settingsElectron: {
            div: document.getElementById('settingsElectron'),
            divs: []
        },
        roaSections: [],
        allSections: [],
        openCount: 0
    }


    constructor() {
        document.getElementById('settingsTitleTop').addEventListener('click', () => this.collapseAllSectionsToggle());
    }

    #getElemForTitleDiv(titleText) {
        const elems = document.getElementsByClassName('settingsTitle');
        for (let i = 0; i < elems.length; i++) {
            if (elems[i].innerHTML.indexOf(titleText) != -1) {
                return this.#getLastElemForTitleDiv(elems[i].nextElementSibling, titleText); 
            }
        }
        return;
    }

    #getLastElemForTitleDiv(curDiv, title) {
        if (curDiv.classList.contains('settingBox')) {
            return this.#getLastElemForTitleDiv(curDiv.nextElementSibling, title)
        } else {
            return curDiv.previousElementSibling;
        }
    }

    genGuiSection(title, section, newToggles, placement, roaSpecific) {
        let containerDiv = document.createElement("div");
        containerDiv.id='SettingsContainerDiv';
        containerDiv.className = 'settingsContainer';
    
        let origDiv = '';


        if (section && this.#validSections.indexOf(section) != -1) {
            origDiv = this.#sections[section].div;
        } else {
            section = 'settingsElectron';
            origDiv = this.#sections[section].div;
        }
        
        let titleDiv = "";
        let toggleDivs = [];
    
        if (title) {
            titleDiv = document.createElement("div");
            titleDiv.className = "settingsTitle";
            titleDiv.innerHTML = title;
            titleDiv.id = title.replaceAll(' ', '') + 'TitleDiv';
            containerDiv.id = title.replaceAll(' ', '') + 'SettingsContainerDiv';
            if (section == 'top') {
                origDiv.prepend(containerDiv);
            } else {
                origDiv.after(containerDiv);
            }

        } else {
            if (section == 'top') {
                origDiv.prepend(containerDiv);
            } else {
                titleDiv = origDiv;
                titleDiv.after(containerDiv);
            }
        }
    
        containerDiv.appendChild(titleDiv);
    
        let prevDiv = titleDiv;
    
        for (let t = 0; t < newToggles.length; t++) {
            let toggle = newToggles[t];
            let toggleDiv = document.createElement("div");
            toggleDiv.className = "settingBox";
            toggleDiv.id = toggle.id + "Div";
    
            if (toggle.settingsBoxOverride) {
                toggleDiv.classList.add(toggle.settingsBoxOverride);
            }
    
    
            let inputLabel = document.createElement("label");
            inputLabel.htmlFor = toggle.id;
            inputLabel.className = "settingsText";
            inputLabel.innerHTML = toggle.innerText;
    
            let toggleInput = this.#genInputBase(toggle);
            
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
            } else if (toggle.type == 'number') {
                toggleDiv.title = toggle.title;
                toggleDiv.appendChild(inputLabel);
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
        
    
        
        // containerDiv.before(titleDiv);  
        // containerDiv.appendChild(titleDiv);
    
        titleDiv.addEventListener('click', () => this.#showHideAllElements(titleDiv, toggleDivs));

        let divs = {
            title: title,
            placement: placement,
            containerDiv: containerDiv,
            titleDiv: titleDiv,
            toggleDivs: toggleDivs,
            prevDiv: prevDiv
        }

        if (roaSpecific) {
            this.#sections.roaSections.push(divs);
        }

        this.#sections[section].divs.push(divs);

        this.#sections.allSections.push(divs);
        this.#sections.openCount++;


        this.#reseatSection(section);


        return divs;
    }

    collapseAllSectionsToggle() {
        let clickAll = false;
        if (this.#sections.openCount == 0) {
            clickAll = true;
        }
        
        for (let i = 0; i < this.#sections.allSections.length; i++) {
            if (clickAll) {
                this.#sections.allSections[i].titleDiv.click();
            } else {
                if (!this.#sections.allSections[i].titleDiv.classList.contains('collapsed')) {
                    this.#sections.allSections[i].titleDiv.click();
                }
            }
        }
    }

    showHideRivalsSections(show) {
        for (let i = 0; i < this.#sections.roaSections.length; i++) {
            if (this.#sections.roaSections[i].containerDiv.classList.contains('hidden')) {
                if (show) {
                    this.#sections.roaSections[i].containerDiv.classList.remove('hidden');
                }
                
            } else {
                if (!show) {
                    this.#sections.roaSections[i].containerDiv.classList.add('hidden');
                }
            }
        }
    }

    #reseatSection(section) {

        function compare( a, b ) {
            if ( a.placement > b.placement ){
              return -1;
            }
            if ( a.placement < b.placement ){
              return 1;
            }
            return 0;
        }
        
        this.#sections[section].divs.sort( compare ); //reverse sort

        for (let i = 0; i < this.#sections[section].divs.length; i++) {
            if (section == 'top') {
                this.#sections[section].div.prepend(this.#sections[section].divs[i].containerDiv);

            } else {
                this.#sections[section].div.after(this.#sections[section].divs[i].containerDiv);
            }
        }
    }

    #showHideAllElements(titleDiv, elements) {
        let showingElems = true;
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].classList.contains('easyGuiHide') ) {
                if (!elements[i].disabled) {
                    showingElems = true;
                    elements[i].classList.remove('easyGuiHide');
                } 
            } else {
                elements[i].classList.add('easyGuiHide');
                showingElems = false;
            }
        }
        if (showingElems) {
            titleDiv.classList.remove('collapsed');
            this.#sections.openCount++;
        } else {
            titleDiv.classList.add('collapsed');
            this.#sections.openCount--;
        }
    }
    
    #showAllElements(elements) {
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].classList.contains('easyGuiHide')) {
                elements[i].classList.remove('easyGuiHide');
            }
        }
    }
    
    #hideAllElements(elements) {
        for (let i = 0; i < elements.length; i++) {
            if (!elements[i].classList.contains('easyGuiHide')) {
                elements[i].classList.add('easyGuiHide');
            }
        }
    }
    
    #genInputBase(toggle) {
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
}

export const guiSection = new EasyGuiSection;