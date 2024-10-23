document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('#search-input');
    const opttionsSelect = document.querySelector('#search-options');
    const btnDate =  document.querySelector('#sum-date');
    const opttionDate = document.querySelector('#date-options');
    const dateInput = document.querySelector('#date-input');

    searchInput.addEventListener('input', function () {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedCriterion = opttionsSelect.value;

        fetch('/api/references')
        .then(response => response.json())
        .then(data => {
            referenceData = data; // Save fetched data // Initial render

         const filteredData = referenceData.filter(ref => {
            const valueToCheck = ref[selectedCriterion];
            if(searchTerm=="") return false;
            return valueToCheck && valueToCheck.toString().toLowerCase().includes(searchTerm);
        });

        renderTable(filteredData);
        })

    });


    function showDatesSum ()
        {
        const selectedDate = opttionDate.value;
            
        fetch('/api/references')
        .then(response => response.json())
        .then(data => {
            referenceData = data; 
       
         const filteredData = referenceData.filter(ref => {
            const valueToCheck = ref[selectedDate];
            return  (valueToCheck == dateInput.value);
        });


        renderTable(filteredData);
        })
        }
    btnDate.addEventListener('click',showDatesSum);
});

