
document.addEventListener('DOMContentLoaded', function () {

 
   window.formatToIsraeliShekels = function (amount) {
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
    
    window.renderTable = function (data) {

        var sumRow = document.getElementById('references-table-sum');
        var sumTran = document.getElementById('sum-tran');
        var sumRef = document.getElementById('sum-ref');
        const tableBody = document.querySelector('#scrollable-body tbody');
    

        tableBody.innerHTML = ''; // Clear existing rows

        // Populate the table with the fetched data
        data.forEach(ref => {

            // Determine if the row should show "Edit" or "Download"
            const fileExt = '.pdf'; // Make sure to adjust for the correct file extension
            const filename = encodeURIComponent(`R${ref.doc_unique}_${ref.ref_num}${fileExt}`);
            var editLink;
            var downloadLink;
           
            if(window.sharedPermission >=3 || true)
                {
                    editLink = `<a href="#" class="edit-link" data-id="${ref.doc_unique}">Edit</a>`;
                }
            else{
                editLink = "cant edit"
                 }
            if(window.sharedPermission >=3 || true)
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
        
           if(colorRowsAttention(ref,row))
                row.classList.add('attention-row'); // Add the 'attention-row' class

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
          if(isNaN(currentValue)) return accumulator;
          else return accumulator + currentValue;         
        }, 0);

        
       sumRow.style.visibility  = 'visible';
        sumTran.textContent = formatToIsraeliShekels(totalTranSum);
        sumRef.textContent = formatToIsraeliShekels(totalRefSum);

        if(data.length>0)
            {
                sumRow.style.visibility  = 'visible';
            }
          else
                {
                    sumRow.style.visibility  = 'hidden';
                }
        
        // Attach event handlers for edit links
        document.querySelectorAll('.edit-link').forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const docId = this.dataset.id;
                const doc = referenceData.find(ref => ref.doc_unique === Number(docId));

                if (doc) {
                    console.log(doc.doc_unique);
                    window.openEditModal(doc); // Call the globally exposed edit modal function
                }
            });
        });

    }



    function colorRowsAttention(ref,row){
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
        ref.ref_num === '' || ref.ref_sum === '' || ref.ref_date === ''))
         {
            return true;
    }

    return false;

}
   
});