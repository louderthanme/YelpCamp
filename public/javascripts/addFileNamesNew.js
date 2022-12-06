
function previewMultiple(event) {
    const form = document.querySelector('#formFile');
    form.innerHTML = "";
    let images = document.getElementById("image");
    let number = images.files.length;
    for (i = 0; i < number; i++) {
        let urls = URL.createObjectURL(event.target.files[i]);
        form.innerHTML += '<img src="' + urls + '">';
    }
}
