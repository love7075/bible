import { versionInfo, bookMap } from "./bibledata";


// export function fillSelect(
//     selectElm: HTMLSelectElement,
//     options: [string, string][] | number,
// ): void {
//     selectElm.innerHTML = "";

//     let optionList: [string, string][];
//     if (typeof options === 'number') {
//         optionList = Array.from({ length: options }, (_, i) => [String(i + 1), String(i + 1)]);
//     } else {
//         optionList = options;
//     }

//     for (const [value, text] of optionList) {
//         const option = document.createElement("option");
//         option.text = text;
//         option.value = value;
//         selectElm.appendChild(option);
//     }
// }

export function fillSelectNumber(selectElm, n) {
    selectElm.innerHTML = "";
    for (let i = 1; i <= n; i++) {
        const option = document.createElement("option");
        option.value = String(i);
        option.text = String(i);
        selectElm.appendChild(option);
    }
}

export function fillSelectArray(selectElm, optionsArray) {
    selectElm.innerHTML = "";
    for (const [value, text] of optionsArray) {
        const option = document.createElement("option");
        option.value = value;
        option.text = text;
        selectElm.appendChild(option);
    }
}