"use strict";
// @ts-nocheck
const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]"));
tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: "hover"
    });
});
const checkDef = $("#checkDef")[0];
const checkConj = $("#checkConj")[0];
const def_hid = $("#def_hid")[0];
const conj_hid = $("#conj_hid")[0];
checkDef.checked = true;
checkConj.checked = true;
checkDef.addEventListener("change", () => {
    onChange(checkDef);
});
checkConj.addEventListener("change", () => {
    onChange(checkConj);
});
function onChange(check) {
    if (!checkDef.checked && !checkConj.checked) {
        if (check === checkDef) {
            checkConj.checked = true;
        }
        else {
            checkDef.checked = true;
        }
    }
    conj_hid.hidden = !checkConj.checked;
    def_hid.hidden = !checkDef.checked;
}
const inputElement = $("#formFile")[0];
let csv;
if (inputElement instanceof HTMLInputElement) {
    inputElement.addEventListener("change", function (event) {
        const fileInput = event.target;
        if ((fileInput.files == null) || fileInput.files.length === 0) {
            console.error("No file selected.");
            return;
        }
        const file = fileInput.files[0];
        Papa.parse(file, {
            complete: function (results) {
                const data = results.data;
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
let conj_answer, def_answer;
let num_correct = 0, num_total = 0;
const conj = $("#conj_inp")[0];
const def = $("#def_inp")[0];
function new_conj() {
    conj.value = "";
    def.value = "";
    const verb_i = Math.floor(Math.random() * csv.length);
    const subjects = ["Yo", "Tú", "Él/Ella/Usted", "Nosotros", "Vosotros", "Ellos/Ellas/Ustedes"];
    const sub_i = Math.floor(Math.random() * 6);
    // const extra_notes = csv[verb_i][2];
    $("#conj")[0].innerHTML = subjects[sub_i] + " " + csv[verb_i][0];
    conj.focus();
    conj_answer = csv[verb_i][2 + sub_i];
    def_answer = csv[verb_i][1];
    $("#def_ans")[0].innerHTML = def_answer;
    $("#conj_ans")[0].innerHTML = conj_answer;
    // $("#extra")[0].innerHTML = extra_notes;
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
    }
    else {
        $("#result")[0].innerHTML = "Incorrect.";
        num_total++;
        conj.focus();
    }
    $("#num_result")[0].innerHTML = `${num_correct} / ${num_total} - ${Math.round((num_correct / num_total) * 100)}%`;
});
const genSentence = $("#gen_sentences")[0];
genSentence.addEventListener("click", function () {
    genSentence.disabled = true;
    setTimeout(function () {
        genSentence.disabled = false;
    }, 60000);
});
