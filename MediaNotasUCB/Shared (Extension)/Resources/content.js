// scraping do site

class Subnota {
    constructor(label, point) {
        this.label = label;
        this.point = point;
    }
}

// Função para obter a label hierarquicamente anterior correta
function getPreviousLabel(element) {
    let current = element;

    // Navega até o elemento que contém a label correta
    while (current) {
        // Verifica se o elemento atual é um <th> ou <td> e se contém uma label
        const label = current.querySelector('th label');
        if (label && label.textContent.trim() !== "") {
            return label.textContent.trim();
        }

        // Navega para o elemento pai
        current = current.parentElement;
    }

    // Se não encontrar, retorna 'Unknown label'
    return 'Unknown label';
}

// Função para obter o ponto baseado na estrutura
function getPoint(element) {
    let current = element;

    // Navega para encontrar o ponto dentro dos elementos esperados
    while (current) {
        // Verifica se o ponto está dentro de uma label específica
        const pointLabel = current.querySelector('label[id]');
        if (pointLabel && pointLabel.textContent.trim() !== "") {
            return pointLabel.textContent.trim();
        }

        // Verifica dentro dos elementos de classe que geralmente contém o ponto
        const pointDiv = current.querySelector('.dco_c');
        if (pointDiv) {
            const pointLabel = pointDiv.querySelector('label:not([id])');
            if (pointLabel) {
                return pointLabel.textContent.trim();
            }
        }

        // Navega para o próximo elemento pai
        current = current.parentElement;
    }
    return 'Unknown point';
}

// Função para obter o nome da grade
function getGradeName() {
    if (window.location.href.includes('/d2l/lms/grades/my_grades')) {
        
        const header = document.querySelector('.d2l-navigation-s-title-container a');
        return header ? header.textContent.trim() : 'Unknown Course';
    }
}

// Função para obter as notas
function getGrades() {
    const grades = {
        n1: {},
        n2: {}
    };

    // Verifica se estamos na página de notas
    if (window.location.href.includes('/d2l/lms/grades/my_grades')) {
        let rows = document.querySelectorAll('tr');

        let isN1 = false;
        let isN2 = false;

        rows.forEach((row, index) => {
            const label = row.querySelector('th label');
            if (label) {
                const text = label.textContent.trim();
                if (text === 'N1') {
                    isN1 = true;
                    isN2 = false;
                } else if (text === 'N2') {
                    isN1 = false;
                    isN2 = true;
                } else if (text.startsWith('AT') && (isN1 || isN2)) {
                    const subnotaType = text.split(' ')[0];
                    
                    // Ignora a linha se o texto for "ATS"
                    if (text.includes('ATS')) {
                        return;
                    }

                    const point = getPoint(row);
                    const prevLabel = getPreviousLabel(row);

                    if (isN1) {
                        grades.n1[subnotaType] = new Subnota(prevLabel, point);
                    } else if (isN2) {
                        grades.n2[subnotaType] = new Subnota(prevLabel, point);
                    }
                }
            }
        });
    }

    return grades;
}

// Enviando dados para a extensão
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Plavra chave
    if (request.update === "please") {
        sendResponse({
            grades: getGrades(),
            gradeName: getGradeName()
        });
    }
});
