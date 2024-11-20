document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('#search-input');
    const opttionsSelect = document.querySelector('#search-options');
    const btnDate =  document.querySelector('#sum-date');
    const opttionDate = document.querySelector('#date-options');
    const dateInputStart = document.querySelector('#date-input-start');
    const dateInputEnd = document.querySelector('#date-input-end');

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
            
        fetch('/api/date-range', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({ start:dateInputStart.value, end:dateInputEnd.value , select:opttionDate.value})
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.data);
            renderTable(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        }
    btnDate.addEventListener('click',showDatesSum);
});

