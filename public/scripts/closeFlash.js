const closeFlashBtn = document.querySelector('.closeFlash');
const flashContainer = document.querySelector('.flashContainer');

if (closeFlashBtn) {
    closeFlashBtn.addEventListener('click', function (e) {
        if (flashContainer) {
            flashContainer.style.display = 'none';
        }

    });
}
