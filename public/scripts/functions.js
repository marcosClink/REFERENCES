
document.addEventListener('DOMContentLoaded', function () {
   window.formatToIsraeliShekels = function formatToIsraeliShekels(amount) {
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
   
})