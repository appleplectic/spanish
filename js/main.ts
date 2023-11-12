// @ts-nocheck
const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]"));
tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: "hover"
    });
});

const checkDef = $("#checkDef")[0] as HTMLInputElement;
const checkConj = $("#checkConj")[0] as HTMLInputElement;
const defHide = $("#defHide")[0];
const conjHide = $("#conjHide")[0];

checkDef.checked = true;
checkConj.checked = true;

checkDef.addEventListener("change", () => {
    onChange(checkDef);
});
checkConj.addEventListener("change", () => {
    onChange(checkConj);
});

function onChange(check: HTMLInputElement) {
    if (!checkDef.checked && !checkConj.checked) {
        if (check === checkDef) {
            checkConj.checked = true;
        } else {
            checkDef.checked = true;
        }
    }
    conjHide.hidden = !checkConj.checked;
    defHide.hidden = !checkDef.checked;
}

const inputElement = $("#formFile")[0] as HTMLInputElement;
let csv: [string[]];
let firstLine: string[];

function parseCSV(results: { data: [string[]]; }) {
    const data: [string[]] = results.data as [string[]];
    firstLine = data.shift() as string[];
    if (data[data.length - 1][0] === "") {
        data.pop();
    }
    $("#hid")[0].classList.toggle("invisible", false);

    csv = data;
    newConjugation();
}

$("#useDefault")[0].addEventListener("click", function () {
    // @ts-expect-error types broken
    Papa.parse("https://raw.githubusercontent.com/appleplectic/spanish-csv/main/spanish.csv", {
        download: true,
        complete: parseCSV
    });
});

inputElement.addEventListener("change", function (event) {
    const fileInput = event.target as HTMLInputElement;
    if ((fileInput.files == null) || fileInput.files.length === 0) {
        console.error("No file selected.");
        return;
    }
    const file = fileInput.files[0];
    // @ts-expect-error types broken
    Papa.parse(file, {
        complete: parseCSV
    });
});

let conjAnswer: string, defAnswer: string;
let numCorrect: number = 0, numTotal: number = 0;
const conj = $("#conjInput")[0] as HTMLInputElement;
const def = $("#defInput")[0] as HTMLInputElement;

function newConjugation() {
    conj.value = "";
    def.value = "";
    const verbIndex = Math.floor(Math.random() * csv.length);
    const subjects = firstLine.slice(2);
    const subjectIndex = Math.floor(Math.random() * 6);
    // const extraNotes = csv[verbIndex][2];
    $("#conj")[0].innerHTML = subjects[subjectIndex] + " " + csv[verbIndex][0];

    if (checkDef.checked) {
        def.focus();
    } else {
        conj.focus();
    }

    conjAnswer = csv[verbIndex][2 + subjectIndex];
    defAnswer = csv[verbIndex][1];

    $("#defAnswer")[0].innerHTML = defAnswer;
    $("#conjAnswer")[0].innerHTML = conjAnswer;
    // $("#extra")[0].innerHTML = extraNotes;
}

conj.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        $("#sub")[0].click();
    }
});

def.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        if (!checkConj.checked) {
            $("#sub")[0].click();
        } else {
            $("#conjInput")[0].focus();
        }
    }
});

$("#sub")[0].addEventListener("click", function () {
    if (conj.value === "" && checkConj.checked) {
        $("#result")[0].innerHTML = "Conjugation box is empty!";
        conj.focus();
        return;
    }
    if (def.value === "" && checkDef.checked) {
        $("#result")[0].innerHTML = "Definition box is empty!";
        def.focus();
        return;
    }
    if ((conj.value === conjAnswer || !checkConj.checked) && (def.value === defAnswer || !checkDef.checked)) {
        $("#result")[0].innerHTML = "Correct!";
        numCorrect++;
        numTotal++;
        newConjugation();
    } else {
        $("#result")[0].innerHTML = "Incorrect.";
        numTotal++;
        conj.focus();
    }
    $("#numResult")[0].innerHTML = `${numCorrect} / ${numTotal} - ${Math.round((numCorrect / numTotal) * 100)}%`;
});

const genSentence = $("#genSentences")[0] as HTMLButtonElement;
genSentence.addEventListener("click", function () {
    genSentence.disabled = true;
    setTimeout(function () {
        genSentence.disabled = false;
    }, 120000);

    const subSentences = $("#subSentences")[0];
    subSentences.classList.toggle("invisible", false);

    const answerList: { [id: number]: string; } = {};

    for (let i = 1; i < 6; i++) {
        const verbIndex = Math.floor(Math.random() * csv.length);
        let wrongVerbIndex = Math.floor(Math.random() * csv.length);
        while (wrongVerbIndex === verbIndex) {
            wrongVerbIndex = Math.floor(Math.random() * csv.length);
        }
        const verb = csv[verbIndex][0];
        const possibleVerbs = csv[verbIndex].slice(2, 8);
        const wrongVerb = csv[wrongVerbIndex][0];
        const verbTense = csv[verbIndex][8];

        const url = new URL("https://api-backend.appleplectic.org:3030/");
        const params = {
            verb: verb,
            tense: verbTense
        };
        url.search = new URLSearchParams(params).toString();
        fetch(url)
            .then(response => {
                if (response.status === 500) {
                    throw new Error("Internal Server Error: 500");
                }
                return response.text();
            })
            .then(data => {
                console.log(data);
                let answer = "";
                for (const pverb of possibleVerbs) {
                    if (data.includes(pverb)) {
                        answer = pverb;
                        break;
                    }
                }
                answerList[i] = answer;
                const sentence = $(`#sentence${i}`)[0];
                sentence.style.color = "rgb(0,0,0)";
                console.log(`#sentence${i}`);
                sentence.classList.toggle("invisible", false);

                if (answer === "") {
                    sentence.innerHTML = "An error occurred; please ignore. If this happens a lot, contact Levin.";
                    throw new Error("Internal Server Error: Verb Not Found");
                }

                const splitted = data.split(answer);
                let randomArr = [wrongVerb, verb];
                if (Math.round(Math.random()) === 1) {
                    randomArr = randomArr.reverse();
                }

                sentence.innerHTML = `${splitted[0]}
<input class="form-control d-inline-block" id="blank${i}" type="text">
${splitted[1]} (${randomArr[0]}/${randomArr[1]})`;
            })
            .catch(error => {
                console.error("Error: ", error);
            });
    }

    subSentences.addEventListener("click", function () {
        $(this).tooltip("hide");
        let numCorrect = 0;
        let numTotal = 0;
        for (let i = 1; i < 6; i++) {
            const answer = answerList[i];
            if (answer !== "") {
                const hElem = $(`#sentence${i}`)[0];
                const inputElem = $(`#blank${i}`)[0] as HTMLInputElement;
                if (inputElem.value === answer) {
                    hElem.style.color = "rgb(0,255,0)";
                    numCorrect++;
                } else {
                    hElem.style.color = "rgb(255,0,0)";
                }
                numTotal++;
            }
        }

        $("#senResult")[0].innerHTML = `${numCorrect} / ${numTotal} - ${Math.round((numCorrect / numTotal) * 100)}%`;
    });
});
