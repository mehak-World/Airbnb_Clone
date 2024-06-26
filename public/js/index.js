
(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

// Review edit btn:

const editBtns = document.querySelectorAll(".edit_btn");
const saveBtns = document.querySelectorAll(".save_btn");

editBtns.forEach((editBtn, index) => {
  editBtn.addEventListener("click", () => {
    const cardBody = editBtn.closest('.card-body');
    const reviewRating = cardBody.querySelector("#review_rating");
    const reviewComment = cardBody.querySelector("#review_comment");
    const saveBtn = cardBody.querySelector(".save_btn");

    reviewRating.removeAttribute("disabled");
    reviewComment.removeAttribute("disabled");
    saveBtn.style.display = "block";
  });
});

saveBtns.forEach((saveBtn) => {
  saveBtn.addEventListener("click", () => {
    const form = saveBtn.closest('form');
    form.submit();
  });
});

// edit.addEventListener("click", () => {
//   review_rating.setAttribute("disabled");
//   review_comment.setAttribute("disabled");
//   edit.style.display = "none";
// })
