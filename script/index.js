const SELECT_OPTIONS = [
    {
        label: 'Camel Case',
        value: 'camel_case',
    },
    {
        label: 'Snake Case',
        value: 'snake_case',
    },
    {
        label: 'Upper Case',
        value: 'upper_case',
    },
    {
        label: 'Lower Case',
        value: 'lower_case',
    },
    {
        label: 'Title Case',
        value: 'title_case',
    },
];

let valuesToStore = {
    input: '',
    selectValues: [],
}

const input = document.querySelector('#text-area-input');
const output = document.querySelector('#text-area-output');
const selectFieldContainer = document.querySelector('.select-fields-container');

function upperCase(text){
    if(typeof text === 'string'){
        return text.toUpperCase();
    }
    return '';
}

function lowerCase(text){
    if(typeof text === 'string'){
        return text.toLowerCase();
    }
    return '';
}

const convertFuncMappings = {
    camel_case: camelCase,
    snake_case: snakeCase,
    title_case: startCase,
    upper_case: upperCase,
    lower_case: lowerCase,
}

function copyToClipboard(text){
    window.navigator.clipboard.writeText(text)
    .then(() => {
        alertPopover('Text copied!');
    }).catch((e) => {
        alertPopover('Something went wrong!', 'error');
        console.log('error::', e);
    })
}

function alertPopover(text = '', className = ''){
    const div = document.createElement('div');
    div.className = 'alert-popover' + ' ' + className;
    div.innerHTML = text;

    document.body.append(div);

    setTimeout(() => div.remove(), 3000);
}

function insertSelectField (elem, defaultValue) {
    const selectField = document.createElement('select');
    selectField.className = 'select-field';

    SELECT_OPTIONS.forEach((selectOption) => {
        const option = document.createElement('option');
        option.value = selectOption.value;
        option.innerHTML = selectOption.label;

        selectField.append(option);
    });

    if(SELECT_OPTIONS.some((option) => option.value === defaultValue)){
        selectField.value = defaultValue;
    }

    elem.append(selectField);
};

function insertRemoveButton(elem) {
    const closeIcon = document.createElement('button');
    closeIcon.className = 'remove-btn';
    closeIcon.innerHTML = 'x';
    closeIcon.type = 'button';
    closeIcon.onclick = () => {
        elem.remove();
        checkHowManyFields();
    }
    elem.append(closeIcon);
    return elem;
}

function checkHowManyFields(){
    const totalSelectContainers = document.querySelectorAll('.select-container');
    const firstSelectContainer = totalSelectContainers[0];

    if(totalSelectContainers.length === 1){
        firstSelectContainer.lastChild.remove();
    } else if(!firstSelectContainer.querySelector('.remove-btn')) {
        insertRemoveButton(firstSelectContainer);
    }

    const selectValues = [];
    for(let selectContainer of totalSelectContainers){
        selectValues.push(selectContainer.firstChild.value);
    }
    valuesToStore.input = input.value;
    valuesToStore.selectValues = selectValues;

    localStorage.setItem('aakash_utils', JSON.stringify(valuesToStore));
}

function addSelectField(defaultValue){
    let div = document.createElement('div');
    div.className = 'select-container'
    insertSelectField(div, defaultValue);
    insertRemoveButton(div);

    selectFieldContainer.append(div);
    checkHowManyFields(); 
}

const localStoredValue = localStorage.getItem("aakash_utils") || "{}";
const parsedStoredValue = JSON.parse(localStoredValue);
const storedInputValue = (parsedStoredValue || {}).input || '';
const storedSelectValues = (parsedStoredValue || {}).selectValues || [];

let isAlreadyAddedSelectField = false;

input.value = typeof storedInputValue === 'string' ? storedInputValue : '';
(Array.isArray(storedSelectValues) ? storedSelectValues : []).forEach((storedSelectValue) => {
    isAlreadyAddedSelectField = true;
    addSelectField(storedSelectValue);
})

if(!isAlreadyAddedSelectField){
    addSelectField();
}

async function convertText(textValue){
    let inputText = textValue || input.value;
    
    if(!inputText){
        return;
    }

    const convertTo = document.querySelectorAll('.select-fields-container select');
    let convertedText = inputText.trim();

    for(let select of convertTo){
        const tempFunc = convertFuncMappings[select.value];
        if(tempFunc && typeof tempFunc === 'function'){
            convertedText = tempFunc(convertedText);
        }
    }

    output.value = convertedText;
    input.value = inputText;

    copyToClipboard(convertedText);
}

input.onkeydown = function (e) {
    if(!e.shiftKey && e.key === 'Enter'){
        e.preventDefault();
        convertText();
    }
}

input.onkeyup = function (){
    valuesToStore.input = input.value;
    localStorage.setItem('aakash_utils', JSON.stringify(valuesToStore));
}

function reset() {
    const children = selectFieldContainer.children;

    while(children.length){
        children[0].remove();
    }
    input.value = '';
    output.value = '';

    addSelectField();
}

async function doMagic(){
    const textFromClipboard = await window.navigator.clipboard.readText();

    if(textFromClipboard && typeof textFromClipboard === 'string'){
        convertText(textFromClipboard);
    }
}