
document.addEventListener('DOMContentLoaded', function () {

    const div = document.querySelector('#all-actions');
        elements = div.querySelectorAll('button,input,select');
        elements.forEach(element => {
         //   element.disabled = false;
           makeElementNotClickable(element);
        });
function makeElementNotClickable(element) {
   // element.classList.remove('clickable');
    element.classList.add('not-clickable');
}
})
