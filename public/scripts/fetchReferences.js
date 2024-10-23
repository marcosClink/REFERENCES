
document.addEventListener('DOMContentLoaded', function () {
    const btnALL = document.querySelector('#all-references');
    const btnTreat = document.querySelector('#ref-treat');
    const btnLate= document.querySelector('#ref-late');

// Function to update referenceData globally
    window.setReferenceData = function(data) {
         window.referenceData = data;
    };

    function showTreatReferences ()
    {
        fetch('/api/treat-references')
        .then(response => response.json())
        .then(data => {
            referenceData = data; // Save fetched data
            renderTable(data); // Initial render
        })
        .catch(error => {
            console.error('Error fetching references:', error);
        });   


    }
    btnTreat.addEventListener('click',showTreatReferences);


    function showLateReferences ()
    {
        fetch('/api/late-references')
        .then(response => response.json())
        .then(data => {
            referenceData = data; // Save fetched data
            renderTable(data); // Initial render
        })
        .catch(error => {
            console.error('Error fetching references:', error);
        });


    }
    btnLate.addEventListener('click',showLateReferences);
   
    function showAllReferences() {
    // Fetch reference data from the server
    fetch('/api/references')
        .then(response => response.json())
        .then(data => {
            referenceData = data; // Save fetched data
            renderTable(data); // Initial render
        })
        .catch(error => {
            console.error('Error fetching references:', error);
        });
   
    }
    btnALL.addEventListener('click', showAllReferences);

});
