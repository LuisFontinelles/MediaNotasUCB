// Regras de negócio do p

opup

document.addEventListener('DOMContentLoaded', asyn c () => {
    const n1Subnotes = document.getElementById('n1-subnotes');
    const n2Subnotes = document.getElementById('n2-subnotes');
    const resultElement = document.getElementById('result');
    const calculateButton = document.getElementById('calculateButton');
    const ppdInput = document.getElementById('ppd');
    const manualInputs = document.getElementById('manual-inputs');
    const autoModeButton = document.getElementById('auto-mode');
    const manualModeButton = document.getElementById('manual-mode');
    const titleElement = document.querySelector('h1');
    const manualN1Input = document.getElementById('manual-n1');
    const manualN2Input = document.getElementById('manual-n2');

    const checkURL = async () => {
        let tabs = await browser.tabs.query({ active: true, currentWindow: true });
        let currentURL = tabs[0].url;
        return currentURL.includes('/d2l/lms/grades/my_grades');
    };

    const isAutoModeAvailable = await checkURL();

    if (!isAutoModeAvailable) {
        autoModeButton.style.opacity = '0.8';
        autoModeButton.style.pointerEvents = 'none';
        manualModeButton.classList.add('active');
        manualInputs.style.display = 'block';
        n1Subnotes.parentElement.style.display = 'none';
        n2Subnotes.parentElement.style.display = 'none';
    } else {
        autoModeButton.style.opacity = '1';
        autoModeButton.style.pointerEvents = 'auto';
        autoModeButton.classList.add('active');
        manualModeButton.classList.remove('active');
        manualInputs.style.display = 'none';
        n1Subnotes.parentElement.style.display = 'block';
        n2Subnotes.parentElement.style.display = 'block';
    }

    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    let response = await browser.tabs.sendMessage(tabs[0].id, { update: "please" });

    if (response?.grades) {
        const { n1, n2 } = response.grades;

        titleElement.textContent = response.gradeName || 'Grades Information';

        const createSubnotes = (container, grades) => {
            container.innerHTML = '';
            for (const key in grades) {
                const grade = grades[key];
                const gradeDiv = document.createElement('div');
                gradeDiv.className = 'grade-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'grade-checkbox';
                checkbox.id = `checkbox-${key}`;
                checkbox.addEventListener('change', () => toggleInputPicker(checkbox, gradeDiv, key, grade.point));

                const checkboxLabel = document.createElement('label');
                checkboxLabel.setAttribute('for', checkbox.id);

                const labelSpan = document.createElement('span');
                labelSpan.className = 'grade-label';
                labelSpan.textContent = grade.label;

                const pointSpan = document.createElement('span');
                pointSpan.className = 'grade-point';
                pointSpan.textContent = grade.point.split(' / ')[0].replace(',', '.');

                const remainingSpan = document.createElement('span');
                remainingSpan.className = 'subnote-value';
                remainingSpan.textContent = grade.point.includes(' / ') ? ` / ${grade.point.split(' / ')[1]}` : '';

                gradeDiv.appendChild(checkbox);
                gradeDiv.appendChild(checkboxLabel);
                gradeDiv.appendChild(labelSpan);
                gradeDiv.appendChild(pointSpan);
                gradeDiv.appendChild(remainingSpan);
                container.appendChild(gradeDiv);
            }
        };

        const toggleInputPicker = (checkbox, gradeDiv, key, originalPointValue) => {
            const isChecked = checkbox.checked;
            const pointSpan = gradeDiv.querySelector('.grade-point');
            const existingPicker = gradeDiv.querySelector(`#picker-${key}`);
            const remainingSpan = gradeDiv.querySelector('.subnote-value');
            const originalRemainingValue = originalPointValue.split(' / ')[1] || '';

            if (isChecked) {
                if (pointSpan) {
                    const pointValue = pointSpan.textContent.trim();
                    const inputPicker = document.createElement('input');
                    inputPicker.type = 'number';
                    inputPicker.className = 'subnote-picker';
                    inputPicker.min = '0';
                    inputPicker.max = '10';
                    inputPicker.step = '0.1';
                    inputPicker.id = `picker-${key}`;
                    inputPicker.value = pointValue;
                    inputPicker.dataset.originalValue = pointValue;

                    gradeDiv.replaceChild(inputPicker, pointSpan);
                }
            } else {
                if (existingPicker) {
                    const originalValue = existingPicker.dataset.originalValue;
                    const newPointSpan = document.createElement('span');
                    newPointSpan.className = 'grade-point';
                    newPointSpan.textContent = originalValue;

                    const newRemainingSpan = document.createElement('span');
                    newRemainingSpan.className = 'subnote-value';
                    newRemainingSpan.textContent = ` / ${originalRemainingValue}`;

                    gradeDiv.replaceChild(newPointSpan, existingPicker);
                    gradeDiv.replaceChild(newRemainingSpan, gradeDiv.querySelector('.subnote-value'));
                }
            }
        };

        createSubnotes(n1Subnotes, n1);
        createSubnotes(n2Subnotes, n2);
    } else {
        n1Subnotes.innerHTML = '<p>N1: Not available</p>';
        n2Subnotes.innerHTML = '<p>N2: Not available</p>';
    }

    const validatePPDInput = () => {
        const ppd = parseFloat(ppdInput.value.replace(',', '.'));
        if (isNaN(ppd) || ppd < 0 || ppd > 1) {
            ppdInput.value = '';
            resultElement.textContent = 'PPD deve ser um número entre 0 e 1.';
        }
    };

    ppdInput.addEventListener('input', validatePPDInput);

    const validateManualInput = (input) => {
        const value = parseFloat(input.value.replace(',', '.'));
        if (isNaN(value) || value < 0 || value > 10) {
            input.value = '';
            resultElement.textContent = 'Notas devem ser um número entre 0 e 10.';
        }
    };

    manualN1Input.addEventListener('input', () => validateManualInput(manualN1Input));
    manualN2Input.addEventListener('input', () => validateManualInput(manualN2Input));

    const getMode = () => {
        return autoModeButton.classList.contains('active') ? 'auto' : 'manual';
    };

    const calculateResult = () => {
        let totalN1 = 0;
        let totalN2 = 0;
        let ppd = parseFloat(ppdInput.value.replace(',', '.')) || 0;
        const mode = getMode();

        if (mode === 'manual') {
            // Calculate based on manual inputs
            const manualN1 = parseFloat(manualN1Input.value.replace(',', '.')) || 0;
            const manualN2 = parseFloat(manualN2Input.value.replace(',', '.')) || 0;
            totalN1 = manualN1;
            totalN2 = manualN2;
        } else {
            // Calculate based on auto mode
            const pointsN1 = n1Subnotes.querySelectorAll('.grade-item');
            pointsN1.forEach(item => {
                const checkbox = item.querySelector('.grade-checkbox');
                const picker = item.querySelector('.subnote-picker');
                const pointSpan = item.querySelector('.grade-point');
                let value;

                if (checkbox.checked && picker) {
                    value = parseFloat(picker.value.replace(',', '.'));
                } else {
                    value = parseFloat(pointSpan.textContent.replace(',', '.'));
                }

                if (!isNaN(value)) {
                    totalN1 += value;
                }
            });

            const pointsN2 = n2Subnotes.querySelectorAll('.grade-item');
            pointsN2.forEach(item => {
                const checkbox = item.querySelector('.grade-checkbox');
                const picker = item.querySelector('.subnote-picker');
                const pointSpan = item.querySelector('.grade-point');
                let value;

                if (checkbox.checked && picker) {
                    value = parseFloat(picker.value.replace(',', '.'));
                } else {
                    value = parseFloat(pointSpan.textContent.replace(',', '.'));
                }

                if (!isNaN(value)) {
                    totalN2 += value;
                }
            });
        }

        let result = (totalN1 * 0.4) + (totalN2 * 0.5) + ppd;

        let message = '';
        if (result >= 7) {
            message = `Aprovado: ${result.toFixed(2).replace('.', ',')}`;
        } else {
            message = `Recuperação: ${result.toFixed(2).replace('.', ',')}`;
        }

        resultElement.textContent = message;
    };

    calculateButton.addEventListener('click', calculateResult);

    autoModeButton.addEventListener('click', () => {
        autoModeButton.classList.add('active');
        manualModeButton.classList.remove('active');
        manualInputs.style.display = 'none';
        n1Subnotes.parentElement.style.display = 'block';
        n2Subnotes.parentElement.style.display = 'block';
        calculateResult();
    });

    manualModeButton.addEventListener('click', () => {
        manualModeButton.classList.add('active');
        autoModeButton.classList.remove('active');
        manualInputs.style.display = 'block';
        n1Subnotes.parentElement.style.display = 'none';
        n2Subnotes.parentElement.style.display = 'none';
        calculateResult();
    });
});
