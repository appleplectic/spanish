// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const spanishVerbs: any;

const checkDef = $("#checkDef")[0] as HTMLInputElement;
const checkConj = $("#checkConj")[0] as HTMLInputElement;
const def_hid = $("#def_hid")[0];
const conj_hid = $("#conj_hid")[0];

checkDef.checked = true;
checkConj.checked = true;

checkDef.addEventListener("change", function () {
    if (!checkConj.checked && !checkDef.hidden) {
        checkConj.checked = true;
    }
    def_hid.hidden = !checkDef.checked;
});

checkConj.addEventListener("change", function () {
    if (!checkDef.checked && !checkConj.hidden) {
        checkDef.checked = true;
    }
    conj_hid.hidden = !checkConj.checked;
});

const inputElement = $("#formFile")[0];
let csv: [string[]];

if (inputElement instanceof HTMLInputElement) {
    inputElement.addEventListener("change", function (event) {
        const fileInput = event.target as HTMLInputElement;
        if ((fileInput.files == null) || fileInput.files.length === 0) {
            console.error("No file selected.");
            return;
        }
        const file = fileInput.files[0];
        Papa.parse(file, {
            complete: function (results) {
                const data: [string[]] = results.data as [string[]];
                data.shift();
                if (data[data.length - 1][0] === "") {
                    data.pop();
                }
                $("#hid")[0].style.visibility = "visible";

                csv = data;
                new_conj();
            }
        });
    });
}

let conj_answer: string, def_answer: string;
let num_correct: number = 0, num_total: number = 0;
const conj = $("#conj_inp")[0] as HTMLInputElement;
const def = $("#def_inp")[0] as HTMLInputElement;

function new_conj() {
    conj.value = "";
    def.value = "";
    const verb_i = Math.floor(Math.random() * csv.length);
    const verb = csv[verb_i][0];
    const subjects = ["Yo", "Tú", "Él/Ella/Usted", "Nosotros", "Vosotros", "Ellos/Ellas/Ustedes"];
    const sub_i = Math.floor(Math.random() * 6);
    $("#conj")[0].innerHTML = subjects[sub_i] + " " + csv[verb_i][0];
    conj.focus();

    conj_answer = spanishVerbs.getConjugation(verb, csv[verb_i][3], sub_i);
    def_answer = csv[verb_i][1];

    $("#def_ans")[0].innerHTML = def_answer;
    $("#conj_ans")[0].innerHTML = conj_answer;
}

conj.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        if (!checkDef.checked) {
            $("#sub")[0].click();
        }
        $("#def_inp")[0].focus();
    }
});

def.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        $("#sub")[0].click();
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
    if ((conj.value === conj_answer || !checkConj.checked) && (def.value === def_answer || !checkDef.checked)) {
        $("#result")[0].innerHTML = "Correct!";
        num_correct++;
        num_total++;
        new_conj();
    } else {
        $("#result")[0].innerHTML = "Incorrect.";
        num_total++;
        conj.focus();
    }
    $("#num_result")[0].innerHTML = `${num_correct} / ${num_total} - ${Math.round((num_correct / num_total) * 100)}%`;
});
