// Check for daily reset
const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
const savedDate = localStorage.getItem("lastVisitDate");

if (savedDate !== today) {
    localStorage.setItem("formsState", JSON.stringify({}));
    localStorage.setItem("lastVisitDate", today);
}

// Load previous state or empty
const formsState = JSON.parse(localStorage.getItem("formsState") || "{}");

function showForms(category) {
    const container = document.getElementById("forms-container");
    container.innerHTML = "";
    container.style.display = "flex";

    azkarData[category].forEach((item, index) => {
        const formKey = category + "_" + index;

        if (formsState[formKey] === undefined) formsState[formKey] = item.maxCount;

        const formItem = document.createElement("div");
        formItem.classList.add("form-item");
        formItem.dataset.count = formsState[formKey];
        formItem.dataset.maxCount = item.maxCount;

        let counterHtml = "";
        if (item.maxCount <= 7) {
            counterHtml = `<div class="counter-numbers"></div>`;
        } else {
            counterHtml = `<div class="counter-numbers">عدد التكرار: ${formsState[formKey]} / ${item.maxCount}</div>`;
        }

        formItem.innerHTML = `
            <div class="icons">
                <i class="fas fa-copy icon" onclick="copyText(event, '${item.text_header + ' ' + item.text_content}')"></i>
                <i class="fas fa-share-alt icon" onclick="shareText(event, '${item.text_header + ' ' + item.text_content}')"></i>
            </div>
            <p class="text-header">${item.text_header}</p>
            <p class="text-content">${item.text_content}</p>
            ${item.text_info ? `<p class="text-info">${item.text_info}</p>` : ''}
            ${item.text_details ? `<p class="text-details">${item.text_details}</p>` : ''}
            <div class="counter-line"></div>
            ${counterHtml}
        `;

        // Small counts (1-7) individual numbers
        if (item.maxCount <= 7) {
            const counterNumbersContainer = formItem.querySelector(".counter-numbers");
            for (let i = 1; i <= item.maxCount; i++) {
                const counterNumber = document.createElement("span");
                counterNumber.classList.add("counter-number");
                counterNumber.textContent = i;
                counterNumbersContainer.appendChild(counterNumber);
            }

            const clickedCount = item.maxCount - formsState[formKey];
            formItem.querySelectorAll(".counter-number").forEach((num, idx) => {
                if (idx < clickedCount) num.classList.add("strikethrough");
            });
        }

        formItem.onclick = function (event) {
            if (event.target.closest(".icon")) return;

            let remaining = parseInt(this.dataset.count);
            if (remaining > 0) {
                remaining--;
                this.dataset.count = remaining;
                formsState[formKey] = remaining;

                if (item.maxCount <= 7) {
                    const counterNumbers = this.querySelectorAll(".counter-number");
                    counterNumbers[item.maxCount - remaining - 1].classList.add("strikethrough");
                } else {
                    this.querySelector(".counter-numbers").textContent = `عدد التكرار: ${remaining} / ${item.maxCount}`;
                }

                if (remaining === 0) this.classList.add("disabled");

                localStorage.setItem("formsState", JSON.stringify(formsState));
            }
        };

        if (formsState[formKey] === 0) formItem.classList.add("disabled");

        container.appendChild(formItem);
    });
}

function copyText(event, text) {
    event.stopPropagation();
    navigator.clipboard.writeText(text);
    alert('تم نسخ النص');
}

function shareText(event, text) {
    event.stopPropagation();
    if (navigator.share) {
        navigator.share({ title: 'أذكار المسلم', text, url: window.location.href });
    } else {
        alert('المشاركة غير مدعومة في هذا المتصفح');
    }
}

// Manual reset button function
function resetToday() {
    if (confirm("هل تريد إعادة ضبط جميع الأذكار لليوم؟")) {
        localStorage.setItem("formsState", JSON.stringify({}));
        localStorage.setItem("lastVisitDate", today);
        location.reload(); // reload to apply changes immediately
    }
}
