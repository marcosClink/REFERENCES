
document.addEventListener('DOMContentLoaded', function () {
    // Global variable to store fetched reference data
    //let referenceData = [];
    const btnALL = document.querySelector('#all-references');
    const btnTreat = document.querySelector('#ref-treat');
    const btnLate= document.querySelector('#ref-late');
    var sumRow = document.getElementById('references-table-sum');
    var sumTran = document.getElementById('sum-tran');
    var sumRef = document.getElementById('sum-ref');
    var permissionUser = window.sharedPermission;
    console.log(window.sharedPermission);



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
           
           // window.setReferenceData(data); // Call the search module to store data for filtering if this function is declared

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
           
           // window.setReferenceData(data); // Call the search module to store data for filtering if this function is declared

        })
        .catch(error => {
            console.error('Error fetching references:', error);
        });


    }
    btnLate.addEventListener('click',showLateReferences);
   
    function showAllReferences() {
    // Fetch reference data from the server
    const password = prompt('Please enter your password:');
    if(password=='marcos'){
    fetch('/api/references')
        .then(response => response.json())
        .then(data => {
            referenceData = data; // Save fetched data
            renderTable(data); // Initial render
           
           // window.setReferenceData(data); // Call the search module to store data for filtering if this function is declared

        })
        .catch(error => {
            console.error('Error fetching references:', error);
        });
    }
    else
    alert("wrong password");
    }
    btnALL.addEventListener('click', showAllReferences);


    // Global function to render reference data in the table
    window.renderTable = function(data) {
        const tableBody = document.querySelector('#scrollable-body tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        // Populate the table with the fetched data
        data.forEach(ref => {
            // Determine if the row should show "Edit" or "Download"
            const fileExt = '.pdf'; // Make sure to adjust for the correct file extension
            const filename = encodeURIComponent(`R${ref.doc_unique}_${ref.ref_num}${fileExt}`);
            var editLink;
            var downloadLink;
            // Direct link to the file for download
            // Use either "/files" or "/download" based on the server setup
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
        
            // Parse the tran_date to a Date object
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
          if(isNaN(currentValue)) return accumulator;
          else return accumulator + currentValue;         
        }, 0);

        const totalRefSum = refSums.reduce((accumulator, currentValue) => {
            console.log(currentValue);
          if(isNaN(currentValue)) return accumulator;
          else return accumulator + currentValue;         
        }, 0);

        
        sumRow.style.visibility  = 'visible';
        sumTran.textContent = formatToIsraeliShekels(totalTranSum);
        sumRef.textContent = formatToIsraeliShekels(totalRefSum);


        // Attach event handlers for edit links
        document.querySelectorAll('.edit-link').forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const docId = this.dataset.id;
                const doc = referenceData.find(ref => ref.doc_unique === Number(docId));

                if (doc) {
                    window.openEditModal(doc); // Call the globally exposed edit modal function
                }
            });
        });

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

    };
});
