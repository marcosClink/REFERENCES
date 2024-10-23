document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('#search-input');
    const opttionsSelect = document.querySelector('#search-options');
    const btnDate =  document.querySelector('#sum-date');
    const opttionDate = document.querySelector('#date-options');
    const dateInput = document.querySelector('#date-input');
    let referenceData =[];
    var sumRow = document.getElementById('references-table-sum');
    var sumTran = document.getElementById('sum-tran');
    var sumRef = document.getElementById('sum-ref');
    const btnDelete = document.getElementById('delete-row-btn');

    window.setReferenceData = function(data) {
        window.referenceData = data;
   };

    searchInput.addEventListener('input', function () {
       // clearTimeout(debounceTimer);
     //   debounceTimer = setTimeout(() => {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedCriterion = opttionsSelect.value;

        fetch('/api/references')
        .then(response => response.json())
        .then(data => {
            referenceData = data; // Save fetched data // Initial render
         // Call the search module to store data for filtering if this function is declared

         const filteredData = referenceData.filter(ref => {
            const valueToCheck = ref[selectedCriterion];
            if(searchTerm=="") return false;
            return valueToCheck && valueToCheck.toString().toLowerCase().includes(searchTerm);
        });


        renderTable(filteredData);
        })

            // Check and filter the reference data
        
  //      }, 300);
    });


    function showDatesSum ()
        {
        const selectedDate = opttionDate.value;
            
        fetch('/api/references')
        .then(response => response.json())
        .then(data => {
            referenceData = data; // Save fetched data // Initial render
         // Call the search module to store data for filtering if this function is declared

         const filteredData = referenceData.filter(ref => {
            const valueToCheck = ref[selectedDate];
            return  (valueToCheck == dateInput.value);
        });


        renderTable(filteredData);
        })
        }
    btnDate.addEventListener('click',showDatesSum);


    function renderTable(data) 
    {
        const tableBody = document.querySelector('#scrollable-body tbody');
        tableBody.innerHTML = '';

        data.forEach(ref => {
 // Determine if the row should show "Edit" or "Download"
 const fileExt = '.pdf'; // Make sure to adjust for the correct file extension
 const filename = encodeURIComponent(`R${ref.doc_unique}_${ref.ref_num}${fileExt}`);

 if(window.sharedPermission >=3)
    {
        editLink = `<a href="#" class="edit-link" data-id="${ref.doc_unique}">Edit</a>`;
    }
else{
    editLink = "cant edit"
     }
if(window.sharedPermission >=4)
    {
downloadLink = `<a href="/download/${filename}" target="_blank">Download</a>`;
    }
    else
    {
        downloadLink = 'cant download';
    }

             const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ref.doc_unique}</td>
                <td>${ref.tran_num}</td>
                <td>${ref.tran_date}</td>
                <td>${formatToIsraeliShekels(ref.tran_sum)}</td>
                <td>${ref.ref_num}</td>
                <td>${ref.ref_date}</td>
                <td>${formatToIsraeliShekels(ref.ref_sum)}</td>
                <td>${downloadLink}</td>
                <td>${editLink}</td>
            `;

            const tranDate = new Date(ref.tran_date);
            const today = new Date();
        
            // Set the time to midnight for comparison
            today.setHours(0, 0, 0, 0);
            tranDate.setHours(0, 0, 0, 0);
        
            // Check if today is more than one day after tran_date
            const oneDayAfter = new Date(tranDate);
            oneDayAfter.setDate(tranDate.getDate() + 1); // Add one day to tran_date
        
            if (today >= oneDayAfter && ( 
                ref.ref_num === '' || ref.ref_sum === '' || ref.ref_date === '' || ref.ref_link === ''))
                 {
                row.classList.add('attention-row'); // Add the 'attention-row' class
            }
            tableBody.appendChild(row);
        });

    const tranSums = data.map(item => parseFloat(item.tran_sum));
    const refSums = data.map(item => parseFloat(item.ref_sum));
// Calculate the total sum
    const totalTranSum = tranSums.reduce((accumulator, currentValue) => {
        console.log(currentValue);
      if(isNaN(currentValue)) return accumulator;
      else return accumulator + currentValue;         
    }, 0);

    const totalRefSum = refSums.reduce((accumulator, currentValue) => {
        console.log(currentValue);
      if(isNaN(currentValue)) return accumulator;
      else return accumulator + currentValue;         
    }, 0);

    
    sumTran.textContent = formatToIsraeliShekels(totalTranSum);
    sumRef.textContent = formatToIsraeliShekels(totalRefSum);

    if(data.length>0)
    {
        sumRow.style.visibility  = 'visible';
        btnDelete.style.visibility = 'visible';
    }
  else
        {
            sumRow.style.visibility  = 'hidden';
            btnDelete.style.visibility = 'hidden';
        }
    

    function formatToIsraeliShekels(amount) {
        // Create a formatter for Israeli Shekels and Hebrew/Israel locale
        const formatter = new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 2, // Ensures two decimal places
            maximumFractionDigits: 2,
        });

            // Format the number
            return formatter.format(amount);
        }

        document.querySelectorAll('.edit-link').forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const docId = this.dataset.id;
                const doc = data.find(ref => ref.doc_unique === Number(docId));

                if (doc) {
                    window.openEditModal(doc); // Call the globally exposed edit modal function
                }
            });
        });
    }
});

