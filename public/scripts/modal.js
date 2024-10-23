document.addEventListener('DOMContentLoaded', function () {
    // Get modal and open button
    const modal = document.querySelector('#modal');
    const btn = document.querySelector('#open-modal');

    // Check if both modal and button exist
    if (!modal || !btn) {
        console.error('Modal or button not found in the DOM');
        return; // Exit if modal or button is not found
    }

    // Function to open add modal and handle form submission
    function openAddModal() {
        fetch('/add_form.html')
            .then(response => response.text())
            .then(html => {
                const modalContent = modal.querySelector('.modal-content');
                modalContent.innerHTML = html; // Load form content
                modal.style.display = 'flex'; // Show modal

                // Attach close functionality
                const closeModal = modalContent.querySelector('.close');
                if (closeModal) {
                    closeModal.addEventListener('click', function() {
                        modal.style.display = 'none';
                    });
                }

                // Handle form submission
                const form = modalContent.querySelector('#add-reference-form');
                if (form) {
                    form.addEventListener('submit', function(event) {
                        event.preventDefault();
                        const formData = new FormData(this);
                
                        fetch('/api/add-reference', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => {
                            if (!response.ok) throw new Error('Failed to add reference');
                            modal.style.display = 'none'; // Hide modal after successful submission
                           fetch('/'); // Refresh to main page
                        })
                        .catch(error => {
                            console.error('Error adding reference:', error);
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error loading the add form:', error);
            });
    }

    // Attach this function to a button or event to open the add modal
    document.querySelector('#open-modal').addEventListener('click', openAddModal);


    function openEditModal(doc) {
        fetch('/edit_form.html') // Fetch edit form HTML
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(html => {
                const modalContent = modal.querySelector('.modal-content');
                modalContent.innerHTML = html;
                modal.style.display = 'flex';

                // Populate edit form with the document data
                document.getElementById('edit_tran_num').value = doc.tran_num;
                document.getElementById('edit_tran_date').value = doc.tran_date;
                document.getElementById('edit_tran_sum').value = window.formatToIsraeliShekels(doc.tran_sum);
                document.getElementById('edit_ref_num').value = doc.ref_num;
                document.getElementById('edit_ref_date').value = doc.ref_date;
                document.getElementById('edit_ref_sum').value = doc.ref_sum;

                console.log(doc.doc_unique);
                // Enable form submission for updating the entry
                document.getElementById('edit-reference-form').addEventListener('submit', function (event) {
                    event.preventDefault();
                    const formData = new FormData(this);
                    //const data = Object.fromEntries(formData.entries());
                    console.log(doc.doc_unique);
                    fetch(`/api/update-reference/${doc.doc_unique}`, {
                        method: 'PUT', // Use PUT if you have RESTful semantics for updates
                       /* headers: {
                            'Content-Type': 'application/json'
                        },*/
                        body: formData //JSON.stringify(data)
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to update reference');
                        modal.style.display = 'none';
                        renderTable([]);
                      //  return fetch('/api/references');
                    })
                 //   .then(response => response.json())
                 //   .then(data => renderTable(data))
                    .catch(error => console.error('Error updating reference:', error));
                });

                // Close modal on outside click
                window.addEventListener('click', function (event) {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                });

                // Close button functionality
                const closeModal = modalContent.querySelector('.close');
                if (closeModal) {
                    closeModal.addEventListener('click', function () {
                        modal.style.display = 'none';
                    });
                }
            })
            .catch(error => {
                console.error('Error loading the edit form:', error);
            });
    }

    window.openEditModal = openEditModal; // Expose the function globally

}); // Closing the DOMContentLoaded event listener
