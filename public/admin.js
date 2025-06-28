let optionCount = 0;

function previewImage(input, previewId) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById(previewId);
      img.src = e.target.result;
      img.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

function removeImage(imgId, hiddenInputId) {
  const img = document.getElementById(imgId);
  const hiddenInput = document.getElementById(hiddenInputId);
  if (img) img.style.display = "none";
  if (hiddenInput) hiddenInput.value = "true";
}

function removeOption(index) {
  const block = document.getElementById("option-block-" + index);
  if (block) block.remove();
  updateOptionLabels();
}

function updateOptionLabels() {
  const select = document.getElementById("correctAnswerSelect");
  const container = document.getElementById("optionsContainer");
  const blocks = Array.from(container.querySelectorAll(".option-block"));
  select.innerHTML = '<option value="">--Select--</option>'; // Reset

  blocks.forEach((block, newIndex) => {
    const letter = String.fromCharCode(65 + newIndex);
    block.dataset.index = newIndex;
    block.id = `option-block-${newIndex}`;

    const label = block.querySelector("label");
    const textInput = block.querySelector("input[type='text']");
    const fileInput = block.querySelector("input[type='file']");
    const img = block.querySelector("img");
    const hiddenInput = block.querySelector("input[type='hidden']");
    const removeBtn = block.querySelector("button.remove-btn");

    // Update label text
    if (label) label.textContent = `Option ${letter} Text`;
    if (textInput) textInput.name = `optionText${newIndex}`;

    if (img) img.id = `previewOptionImage${newIndex}`;

    if (fileInput) {
      fileInput.name = `optionImage${newIndex}`;
      fileInput.setAttribute("onchange", `previewImage(this, 'previewOptionImage${newIndex}')`);
    }

    if (hiddenInput) {
      hiddenInput.name = `removeOptionImage${newIndex}`;
      hiddenInput.id = `removeOptionImage${newIndex}`;
    }

    if (removeBtn) {
      removeBtn.setAttribute("onclick", `removeOption(${newIndex})`);
    }

    const option = document.createElement("option");
    option.value = letter;
    option.textContent = `Option ${letter}`;
    if (letter === correctAns) option.selected = true;
    select.appendChild(option);
  });

  optionCount = blocks.length;
}

function addOption(opt = {}) {
  const i = optionCount;
  const letter = String.fromCharCode(65 + i);
  const container = document.createElement("div");
  container.className = "option-block";
  container.id = `option-block-${i}`;
  container.dataset.index = i;

  container.innerHTML = `
    <label>Option ${letter} Text</label>
    <input type="text" name="optionText${i}" value="${opt.text || ''}">

    <div class="image-card">
      <img id="previewOptionImage${i}" src="${opt.image ? '/uploads/' + opt.image : ''}" style="${opt.image ? '' : 'display:none'}">
      ${opt.image ? `<input type="hidden" name="removeOptionImage${i}" id="removeOptionImage${i}" value="false">` : ''}
      <label class="custom-file-btn">
        Choose Image for Option ${letter}
        <input type="file" name="optionImage${i}" accept="image/*" onchange="previewImage(this, 'previewOptionImage${i}')">
      </label>
    </div>

    <button type="button" class="remove-btn" onclick="removeOption(${i})">Remove Option</button>
  `;

  document.getElementById("optionsContainer").appendChild(container);
  optionCount++;
  updateOptionLabels();
}

// Load existing options on page load
window.addEventListener("DOMContentLoaded", () => {
  existingOptions.forEach(opt => addOption(opt));
});
