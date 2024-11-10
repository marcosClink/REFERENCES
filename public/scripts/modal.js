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
        fetch('/views/add_form.html')
            .then(response => response.text())
            .then(html => {
                const modalContent = modal.querySelector('.modal-content');
                modalContent.innerHTML = html; // Load form content
                modal.style.display = 'flex'; // Show modal

                // Attach close functionality
                const closeModal = modalContent.querySelector('.close');
                if (closeModal) {
                    closeModal.addEventListener('click', function () {
                        modal.style.display = 'none';
                    });
                }

                // Handle form submission
                const form = modalContent.querySelector('#add-reference-form');
                if (form) {
                    form.addEventListener('submit', function (event) {
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
        fetch('/views/edit_form.html') // Fetch edit form HTML
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(html => {
                const modalContent = modal.querySelector('.modal-content');
                modalContent.innerHTML = html;
                modal.style.display = 'flex';

                // Populate edit form with the document data
                document.getElementById('edit_id_buyer').value = doc.id_buyer;
                document.getElementById('edit_tran_num').value = doc.tran_num;
                document.getElementById('edit_tran_date').value = doc.tran_date;
                document.getElementById('edit_tran_sum').value = window.formatToIsraeliShekels(doc.tran_sum);
                document.getElementById('edit_id_seller').value = doc.id_seller;
                document.getElementById('edit_ref_num').value = doc.ref_num;
                document.getElementById('edit_ref_date').value = doc.ref_date;
                document.getElementById('edit_ref_sum').value = doc.ref_sum;


                // Enable form submission for updating the entry
                document.getElementById('edit-reference-form').addEventListener('submit', function (event) {
                    event.preventDefault();
                    const formData = new FormData(this);

                    fetch(`/api/update-reference/${doc.doc_unique}`, {
                        method: 'PUT',
                        body: formData
                    })
                        .then(response => {
                            if (!response.ok) throw new Error('Failed to update reference');
                            modal.style.display = 'none';
                            renderTable([]);
                        })
                        .catch(error => console.error('Error updating reference:', error));
                });

                function deleteTrans() {
                    const fileExt = '.pdf'; // Make sure to adjust for the correct file extension
                    const filename = encodeURIComponent(`R${doc.doc_unique}_${doc.ref_num}${fileExt}`);
                    fetch(`/api/delete-trans/${doc.doc_unique}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json' // Indicate that you are sending JSON
                        },
                        body: JSON.stringify({filename})
                    })
                        .then(response => {
                            if (!response.ok) console.error("problem with server side")
                            modal.style.display = 'none';
                            alert(`הרשומה ${doc.doc_unique} נמחקה בהצלחה`);
                            renderTable([]);
                        })
                        .catch(error => console.error('Error updating reference:', error));

                }
                document.getElementById("delete-trans").addEventListener('click', deleteTrans);

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
